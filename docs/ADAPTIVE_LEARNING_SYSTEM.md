# Adaptive Learning System — BKT/MARE in the User Profile

This document describes the system that stores **per-subject (and per-skill) user data** using the BKT engine (MARE), persists **every number in the user's profile**, and uses **ranges per subject** to drive **adaptive difficulty** for questions and LLM answers — challenging enough to feel rewarding, easy enough to solve (zone of proximal development).

---

## 1. Goals

- **Store** BKT state (mastery probability, evidence count, last updated) **per user per skill** in a way that is tied to the user profile (Supabase or tutoring-api DB).
- **Per-subject aggregation** so we can say: "In Math, does this user have enough data? Have they mastered enough to work without guiding?"
- **Ranges per subject** to decide:
  - **Enough data**: minimum evidence before we trust adaptation (e.g. ≥ 5 responses in that subject).
  - **Mastered / independent**: mastery high enough (e.g. ≥ 0.75) to ask questions **without scaffolding** (no hints, no step-by-step).
  - **Challenge band**: target difficulty slightly above current mastery so questions feel "hard but doable."
- **Adaptive LLM and questions**: answers and question difficulty are **relative to the student's pace** — neither too easy (boring) nor too hard (frustrating).

---

## 2. Data Model

### 2.1 What We Store (the “numbers” in the profile)

For each **(user, skill)** we persist:

| Field | Type | Meaning |
|-------|------|---------|
| `mastery_probability` | float [0,1] | P(mastered) after BKT update (MARE). |
| `evidence_count` | int | Number of responses (correct/incorrect) used to compute mastery. |
| `last_updated_at` | timestamp | Last time this state was updated. |
| `params_version` | string | BKT parameter set (e.g. `v1-fixed`) for reproducibility. |

Optional for diagnostics: recent pattern (`mastered` / `developing` / `struggling` / etc.) and recommended action.

### 2.2 Where It Lives

- **Option A — Tutoring-API as source of truth**: Existing `skill_states` and `evidence_events` tables in tutoring-api (SQLite/Postgres). The app calls tutoring-api with `student_id = Supabase user id`; no duplicate storage. Profile “has” this data by reference (same user id).
- **Option B — Supabase in the same place as profile**: New tables in Supabase: `user_skill_state`, `skills` (skill_id, subject_id), and optionally `evidence_events`. App and/or Edge Functions read/write here; tutoring-api can be used only for BKT math or deprecated.
- **Recommended for YC pitch**: Option B (or sync from tutoring-api to Supabase) so “everything about the user” lives in one place (profile + progress + skill state). Easiest to explain: “We store each student’s mastery per subject in their profile.”

### 2.3 Subject and skill mapping

- **Subject** = one “house” or topic area (e.g. Math, Physics). Stored as `subject_id` (e.g. house id or string).
- **Skill** = one BKT dimension (e.g. “linear_equations”, “quadratics”). Each skill has a `subject_id`.
- **Content** (lesson, quiz item) maps to a skill via `content_skill_map`: `content_id` → `skill_id`. So when the user answers a question, we know which skill to update.

So: **House (subject) → Lessons → Questions/Content → Skill**. Per-subject metrics are computed by aggregating over all skills in that subject.

---

## 3. Ranges per Subject

We compute these **per subject** (aggregating over skills in that subject):

| Range / threshold | Name | Typical value | Use |
|-------------------|------|----------------|-------|
| **Enough data** | `MIN_EVIDENCE_FOR_ADAPTATION` | 5 | Total evidence (across skills in subject) ≥ this before we use mastery to adapt difficulty and LLM. Below this we use “default” or “cold start” behavior. |
| **Mastered / independent** | `MASTERY_INDEPENDENT` | 0.75 | If (e.g. minimum or average) mastery in subject ≥ this, we treat the student as able to answer **without guiding** (unscaffolded questions, fewer hints). |
| **Challenge band** | — | [mastery − 0.2, mastery + 0.2] clamped to [0,1] | Target question difficulty so the student is in the zone of proximal development: slightly above current mastery. |

You can tune these per subject (e.g. stricter for Math, looser for Reading) by storing subject-level config.

### 3.1 Derived flags (for product/LLM)

- **`has_enough_data`**: `total_evidence_in_subject >= MIN_EVIDENCE_FOR_ADAPTATION`.
- **`mastered_for_independent`**: e.g. `min_mastery_in_subject >= MASTERY_INDEPENDENT` (or average, depending on policy).
- **`suggested_difficulty_min/max`**: from challenge band; LLM and question selector use this to pick depth and difficulty.

---

## 4. End-to-end Flow

1. **Student answers a question** (app or exam screen).
2. App (or backend) sends **feedback** to tutoring-api: `student_id`, `content_id`, `is_correct`, `timestamp`, optional `subject_id`.
3. **Mapping**: `content_id` → `skill_id` (from content_skill_map); optionally `skill_id` → `subject_id` (from skills table).
4. **BKT (MARE)**: `mareUpdate(previousState, event)` → new `SkillState` (mastery, evidence_count, etc.).
5. **Persist**: Save new state to `skill_states` (tutoring-api) and/or sync to Supabase `user_skill_state`.
6. **Next question / LLM**:
   - Request **adaptive context** for this user and subject: GET `/adaptive-context/{student_id}?subject_id=...`.
   - Response includes: `has_enough_data`, `mastered_for_independent`, `suggested_difficulty_min/max`, and per-skill list (mastery, evidence).
   - **Question selector**: choose difficulty in `[suggested_difficulty_min, suggested_difficulty_max]`; if not `mastered_for_independent`, include scaffolding/hints.
   - **LLM (/ask)**: send in the prompt the student’s mastery band and “explain at this level; don’t over-explain if they’re strong, don’t assume too much if they’re new.”

So: **each number is stored in the user’s (skill) profile** → **ranges are computed per subject** → **adaptation (difficulty + guiding vs independent) is driven by those ranges**.

---

## 5. Adaptive LLM and Questions

- **LLM**: When calling `/ask`, include in the system or user prompt:
  - “The student’s current mastery in this topic is approximately X (0–1). Adjust your explanation: depth and difficulty should match this level — challenging but solvable.”
  - Optionally: “Prefer no step-by-step scaffolding” when `mastered_for_independent` is true.
- **Questions**: Use `suggested_difficulty_min/max` to filter or generate questions in that band; use `mastered_for_independent` to decide whether to show hints or unscaffolded items.

This keeps the experience **relative to the student’s pace** and makes the system pitch-ready (“We adapt in real time to each student’s level”).

---

## 6. Y Combinator One-Pager (problem / solution / magic)

- **Problem**: Learning apps either bore strong students or overwhelm struggling ones; one size doesn’t fit all.
- **Solution**: Mentorium uses **Bayesian Knowledge Tracing (BKT)** to store, per student and per subject, a **mastery estimate and evidence count** in the user’s profile. Every interaction updates these numbers.
- **Ranges**: We define per-subject thresholds: “enough data” to personalize, and “mastered enough” to work without guiding. Questions and AI explanations are **adapted to the student’s level** — challenging enough to feel smart, easy enough to solve.
- **Magic**: The “numbers” (mastery, evidence) are **always in the profile**, so adaptation is consistent across sessions and devices, and we can show progress and readiness (e.g. “Ready for unguided practice”) in the UI. The same engine (BKT/MARE) drives both **assessment** and **personalization**, which is a strong technical differentiator for a YC pitch.

---

## 7. Implementation Checklist

- [x] **Schema**: `user_skill_state`, `skills`, `content_skill_map` in Supabase (migration `009_adaptive_learning_skill_state.sql`). Tutoring-api has `skill_states`, `evidence_events`, `content_skill_map`, and `skills` (skill_id, subject_id).
- [x] **Ranges**: In tutoring-api: `MIN_EVIDENCE_FOR_ADAPTATION` (5), `MASTERY_INDEPENDENT` (0.75), `CHALLENGE_BAND_WIDTH` (0.2); `_compute_adaptive_context()` returns `has_enough_data`, `mastered_for_independent`, `suggested_difficulty_min/max`.
- [x] **Endpoint**: GET `/adaptive-context/{student_id}?subject_id=...` returns flags + per-skill state.
- [x] **/ask**: Optional `subject_id` (and `skill_id`) in body; when present, adaptive context is fetched and injected into the LLM prompt (mastery band + scaffolding hint).
- [ ] **App**: Wire exam/lesson screens: after each answer call `submitFeedback()`; before question/LLM call `getAdaptiveContext()` (or `useAdaptiveContext`) and pass to question selector and /ask (e.g. set `subject_id` when calling tutoring-api `/ask`).
- [x] **Profile**: Types and API in app: `AdaptiveContext`, `SkillStateSummary`, `getAdaptiveContext()`, `submitFeedback()`, `useAdaptiveContext` hook. Skill state is stored in tutoring-api (student_id = user id) and optionally synced to Supabase `user_skill_state`.

This system gives you a single place (the user profile + skill state) for “each number,” ranges per subject for data and mastery, and adaptive behavior for both the LLM and the questions — ready to pitch to Y Combinator.

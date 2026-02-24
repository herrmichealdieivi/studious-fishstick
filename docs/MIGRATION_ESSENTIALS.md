# Mentorium — Essential Files for a Fresh Build

Use this list when starting over: these files implement **key features**. Without them, Mentorium loses that feature.

---

## 1. Auth (Supabase + profiles)

**Without these:** No sign-in, sign-up, or user identity.

| File | Purpose |
|------|--------|
| `mentorium-app/services/supabase.js` | Supabase client + Expo SecureStore for session |
| `mentorium-app/services/auth.js` | login, signup, getCurrentUser, profile helpers |
| `mentorium-app/app/signin.tsx` | Sign-in screen |
| `mentorium-app/app/signup.tsx` | Sign-up screen |
| **Env** | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (copy from `.env.example`; never commit real `.env`) |

**DB (must run in new project):**  
`mentorium-app/infra/supabase/migrations/006_auth_profiles_and_triggers.sql` — `profiles` table + `handle_new_user` trigger.

Also needed for profiles: `007_add_language_preference.sql`, `008_add_onboarding_field.sql`.

---

## 2. Lessons + houses + progress

**Without these:** No houses, lessons, or “completed” state.

| File | Purpose |
|------|--------|
| `mentorium-app/app/house.tsx` | Single house view |
| `mentorium-app/app/houses.tsx` | Houses list; navigate to house/lesson |
| `mentorium-app/app/lesson/[id].tsx` | Load lesson, progress, ensure chunks for Q&A |
| `mentorium-app/app/tabs/home.tsx` | Home (uses profiles, navigation) |
| `mentorium-app/components/LessonCard.tsx` | Lesson cards in house |

**DB:**  
- `001_create_tables.sql` — `houses`, `lessons`, `quizzes`, `user_progress`.  
- `002_create_policies_and_indexes.sql` — RLS/policies for these tables.

---

## 3. In-lesson Q&A (RAG — MARE)

**Without these:** No “ask a question” during a lesson (no RAG).

| File | Purpose |
|------|--------|
| `mentorium-app/services/rag.js` | Uses **MARE** `RAGEngine`: indexLessonContent, answerQuestion; writes to `lesson_chunks` & `lesson_questions` |
| `mentorium-app/components/QnAPanel.tsx` | UI that calls RAG to answer questions |
| **MARE package (whole folder)** | `MARE/` — RAG + BKT; app depends on `@mentorium/mare` (RAGEngine) |

**DB:**  
`004_rag_enhanced_features.sql` — `lesson_chunks`, `lesson_questions` (and `exam_attempts`).

**Env:**  
`OPENAI_API_KEY` (or your app’s env name for OpenAI) — used in `rag.js` and MARE.

---

## 4. Exams (dynamic questions + attempts)

**Without these:** No exam flow or stored attempts.

| File | Purpose |
|------|--------|
| `mentorium-app/services/exam.js` | generateExamQuestions (uses lesson + chunks + LLM), save attempt to `exam_attempts` |
| `mentorium-app/app/exam/[lessonId].tsx` | Exam screen for a lesson |
| `mentorium-app/components/Quiz.tsx` | Quiz UI (if used by exam screen) |

**DB:**  
`004_rag_enhanced_features.sql` — `exam_attempts` table.

**Env:**  
OpenAI (or same LLM key) for generating questions.

---

## 5. Design system (shared UI)

**Without these:** You lose one shared place for colors/spacing; UI constants scatter.

| File | Purpose |
|------|--------|
| `packages/design-tokens/package.json` | Package definition |
| `packages/design-tokens/index.js` | Colors, fonts, spacing used by app (and web) |

Root `package.json` workspaces must include `packages/*` and the app must depend on `@mentorium/design-tokens`.

---

## 6. Content + DB schema (what’s in the DB)

**Without these:** No curriculum data or wrong schema.

| File | Purpose |
|------|--------|
| `mentorium-app/data/biology-content.json` | Example house/lessons/quizzes (reference or seed) |
| `mentorium-app/scripts/upload-content.js` | Script to push houses/lessons/quizzes to Supabase (fix URL/key before use) |
| **All migrations in order** | `mentorium-app/infra/supabase/migrations/` — run in order (001 → 008 + any extras) so tables, RLS, and triggers match the app |

Seed data in `003_seed_initial_data.sql` is optional/placeholder; real content can come from `upload-content.js` or your own seed.

---

## 7. Onboarding

**Without these:** No guided onboarding or “onboarding completed” flag.

| File | Purpose |
|------|--------|
| `mentorium-app/MentoriumOnboarding/` | Onboarding flows (NewcomerPath, ElderPath, ReturningUserFlow, state, backendAPI) |
| `mentorium-app/app/onboarding.tsx` | Screen that hosts onboarding |
| **DB** | `008_add_onboarding_field.sql` — `profiles.onboarding_completed` |

`MentoriumOnboarding/services/backendAPI.js` talks to Supabase (profiles); keep it in sync with your auth/profile shape.

---

## 8. Routing + layout (Expo Router)

**Without these:** App structure and navigation break.

| File | Purpose |
|------|--------|
| `mentorium-app/app/_layout.tsx` | Root layout, auth/session checks, tabs |
| `mentorium-app/app/index.tsx` | Entry (redirect to signin/home/onboarding) |
| `mentorium-app/app/tabs/*` | Tab screens (home, you, houses, examhall, etc.) |

---

## 9. Optional but useful

- **Language (i18n):** `mentorium-app/contexts/LanguageContext.tsx` + `profiles.language` (007) — if you want en/ar.
- **Settings:** `mentorium-app/app/settings.tsx` — profile/settings screen.
- **Explain button:** `mentorium-app/components/ExplainButton.tsx` — if you use it in lessons.
- **BKT/diagnostics:** MARE’s `mareUpdate` / BKT are **not** used by the app yet; only RAG is. Migrate `MARE/` if you plan to add skill tracking later.

---

## 10. What you can drop in a fresh start

- **Legacy RAG:** `RAG/` (Python video RAG) — you’re moving to ARG; only migrate if you need that code.
- **Duplicate/empty:** `Contex.md` (empty), or anything you’ve replaced.
- **Web app:** `mentorium-web/` — only if the new build is mobile-first and you’ll recreate web later.
- **Expo cache:** `.expo/` — safe to not copy; regenerated on run.

**Nice-to-have files (easy to miss):** See **`docs/MIGRATION_NICE_TO_HAVE.md`** for a full list: build config, seeds, content generation, LLM service, audit logging, CI/CD, docs, tests, and more.

---

## Checklist for “next build”

1. **Monorepo root:** `package.json` (workspaces: app, MARE, `packages/*`), `tsconfig.json`, root `.gitignore`.
2. **App:** Copy the “Auth”, “Lessons + houses + progress”, “RAG”, “Exams”, “Routing + layout” files above; add `services/supabase.js` and `services/auth.js` first.
3. **MARE:** Copy entire `MARE/` (or at least `src/`, `skills/`, `package.json`) and keep workspace dep `@mentorium/mare`.
4. **Design:** Copy `packages/design-tokens/` and keep `@mentorium/design-tokens` in the app.
5. **DB:** Run all migrations in `mentorium-app/infra/supabase/migrations/` in order on the new Supabase project.
6. **Env:** Recreate `.env` from `.env.example` (Supabase URL/anon key, OpenAI key); never commit `.env`.
7. **Content:** Use `upload-content.js` or `biology-content.json` to seed houses/lessons (and quizzes if you use them).
8. **Onboarding:** Copy `MentoriumOnboarding/` + `app/onboarding.tsx` and ensure `008_add_onboarding_field.sql` is applied.

After that, Mentorium keeps: **auth, houses/lessons/progress, in-lesson Q&A (RAG), exams, design system, onboarding, and routing.**

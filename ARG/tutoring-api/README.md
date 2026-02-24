# AI Tutoring API

FastAPI service: **BKT** (Bayesian Knowledge Tracing) + **OpenRouter** or **Groq** for low-cost/free LLM Q&A and feedback.

## Setup

```bash
cd tutoring-api
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

## Environment

**OpenRouter** (cheap paid):

```bash
set LLM_PROVIDER=openrouter
set OPENROUTER_API_KEY=sk-...
```

**Groq** (free tier):

```bash
set LLM_PROVIDER=groq
set GROQ_API_KEY=gsk-...
```

Optional: `DATABASE_URL` (default `sqlite:///./tutoring.db`), `PORT` (default `8000`).

## Run

```bash
python main.py
```

API: http://localhost:8000  
Docs: http://localhost:8000/docs

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/feedback` | Submit correct/incorrect; returns mastery + recommendations |
| POST | `/ask` | Ask a question (video_id + question); optional `subject_id` for adaptive LLM prompt |
| GET | `/adaptive-context/{student_id}?subject_id=...` | Per-subject ranges: has_enough_data, mastered_for_independent, suggested_difficulty band |
| GET | `/skill/{student_id}/{skill_id}` | Get mastery for one skill |
| GET | `/skills/{student_id}` | Get all skills for a student |
| GET | `/cache/stats` | Cache hit stats |
| GET | `/health` | Health check |

## Content → skill mapping

`/feedback` maps `content_id` to `skill_id` via the `content_skill_map` table. Seed it with your lesson/quiz content IDs so BKT can track mastery per skill.

## Adaptive learning (per-subject ranges)

The `skills` table maps `skill_id` → `subject_id` (e.g. house id). Seed it so `/adaptive-context` can aggregate by subject:

```sql
INSERT INTO skills (skill_id, subject_id) VALUES ('algebra_basics', '1'), ('linear_equations', '1');
```

Same `subject_id` in `content_skill_map` (via skill_id) links content to a subject. Ranges: **enough data** = total evidence in subject ≥ 5; **mastered for independent** = min mastery in subject ≥ 0.75; **challenge band** = [avg_mastery − 0.2, avg_mastery + 0.2]. Use these to adapt question difficulty and LLM explanations to the student's pace.

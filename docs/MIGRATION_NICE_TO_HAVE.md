# Mentorium — Nice to Have (Easy to Miss)

Files that aren’t required for core features but are useful to bring so you don’t have to recreate them. Consider copying these when migrating to the next build.

---

## Theme + i18n

| File | Why bring it |
|------|----------------|
| `mentorium-app/contexts/LanguageContext.tsx` | Single place for **theme (dark/light)** and **translations (en/ar)**. Your only centralized theme right now; reuse or replace with `src/theme/` in the new structure. |

---

## Build & config (app actually runs)

| File | Why bring it |
|------|----------------|
| `mentorium-app/app.json` | Expo app config (name, slug, scheme). |
| `mentorium-app/babel.config.js` | Babel config (e.g. for react-native-dotenv). |
| `mentorium-app/metro.config.js` | Metro bundler config. |
| `mentorium-app/tsconfig.json` | TypeScript config for the app. |
| `mentorium-app/.gitignore` | So you don’t commit `.env`, `node_modules`, etc. |

---

## Seeds & content generation

| File | Why bring it |
|------|----------------|
| `mentorium-app/infra/supabase/seeds/sample-data.sql` | Real sample houses/lessons (Biology, Chemistry, Physics). Better than the placeholder in `003`. |
| `mentorium-app/scripts/generate-content.js` | Converts **transcripts → structured lessons + quizzes** (uses Groq). Handy if you add new subjects from video/audio. |

---

## LLM beyond RAG

| File | Why bring it |
|------|----------------|
| `mentorium-app/services/llm.js` | Multi-provider (OpenAI, Anthropic, Ollama): content gen, quiz gen, personalized explanations. RAG/exam use their own services; this is for other LLM features. |

---

## Video RAG (optional)

| File | Why bring it |
|------|----------------|
| `mentorium-app/services/videoRag.js` | Calls the Python video RAG API. Only if you want video Q&A in the new app before ARG is ready. |

---

## DB & infra

| File | Why bring it |
|------|----------------|
| `mentorium-app/infra/supabase/migrations/005_audit_logging.sql` | `audit_log` table + trigger on `user_progress`. Nice for production and debugging. |
| `mentorium-app/infra/supabase/migrations/combined_schema.sql` | Full schema snapshot (if present); quick reference when wiring the new app. |
| `mentorium-app/infra/supabase/README.md` | Explains Supabase setup and migrations. |

---

## CI/CD

| File | Why bring it |
|------|----------------|
| `mentorium-app/.github/workflows/deploy.yml` | Runs Supabase migrations on push/PR (staging + optional prod). Copy if you use GitHub Actions. |

---

## Docs (onboarding yourself or a dev later)

| File | Why bring it |
|------|----------------|
| `mentorium-app/docs/setup/QUICK_START.md` | Quick start. |
| `mentorium-app/docs/setup/SUPABASE_SETUP_CHECKLIST.md`, `SUPABASE_URL_SETUP.md` | Supabase setup. |
| `mentorium-app/docs/guides/CONTENT_GUIDE.md`, `LLM_QUICK_START.md`, `LLM_INTEGRATION_GUIDE.md` | Content and LLM usage. |
| `mentorium-app/docs/guides/ONBOARDING_IMPLEMENTATION.md` | How onboarding is wired. |
| `mentorium-app/docs/infrastructure/INFRASTRUCTURE_SUMMARY.md`, `AUTH_SYSTEM_SUMMARY.md` | High-level infra and auth. |
| `mentorium-app/docs/README.md`, `STRUCTURE.md` | Doc index and app structure. |
| `mentorium-app/MentoriumOnboarding/IMPLEMENTATION_SUMMARY.md` | Onboarding implementation notes. |

---

## Tests

| File | Why bring it |
|------|----------------|
| `mentorium-app/__tests__/onboarding.test.js` | Only test file in the app; useful as a regression check for onboarding. |

---

## Reusable layout

| File | Why bring it |
|------|----------------|
| `mentorium-app/components/HallwayContainer.tsx` | Shared layout for hallway-style tabs; reuse or replace in the new component set. |

---

## Scripts

| File | Why bring it |
|------|----------------|
| `mentorium-app/scripts/run-onboarding.js` | Runs onboarding flow (e.g. demo). |

---

**See also:** `MIGRATION_ESSENTIALS.md` for the must-have list; `ARCHITECTURE_NEXT.md` and `UI_DIRECTION.md` for the next build’s structure and UI.

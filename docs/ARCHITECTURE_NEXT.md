# Mentorium — Target Architecture (Next Build)

This doc defines a **clean structure** so the next codebase doesn’t turn into spaghetti. Use it when you start over.

---

## Problems in the current structure

- **Screens do too much**: Supabase calls, business logic (e.g. `ensureLessonChunks`, `markComplete`), and UI all in one file.
- **No single data layer**: Many files call `supabase.from('...')` directly → duplication and hard-to-change behavior.
- **Inconsistent theming**: Some screens use `LanguageContext` colors, others hardcode hex (`#171717`, `#D3EFE9`). Design tokens exist but aren’t the single source.
- **Two “house” flows**: Dashboard has mock house detail; `house.tsx` has real Supabase data. Same concept, different entry points and UIs.
- **Routing inconsistency**: Index sends logged-in users to `/dashboard`; signin sends them to `/house`.
- **Huge single files**: e.g. `home.tsx` 300+ lines with inline SVGs and two large render functions.
- **Business logic in components**: e.g. progress calculation, chunk indexing, “ensure chunks” logic live inside screen components.

---

## Target folder structure

Use a **feature-first + shared layers** layout. No “everything in one screen” files.

```
mentorium-app/
├── app/                    # Routes only — thin, no Supabase or business logic
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (auth)/
│   │   ├── signin.tsx
│   │   └── signup.tsx
│   ├── (app)/              # Logged-in shell (tabs or stack)
│   │   ├── _layout.tsx     # Tabs or main stack
│   │   ├── index.tsx       # Home / dashboard
│   │   ├── house/[id].tsx
│   │   ├── lesson/[id].tsx
│   │   ├── exam/[lessonId].tsx
│   │   └── settings.tsx
│   └── onboarding.tsx
│
├── src/
│   ├── api/                # Single data layer — all Supabase/HTTP here
│   │   ├── client.ts       # Supabase client (from env)
│   │   ├── auth.ts         # login, signup, getSession, getProfile, updateProfile
│   │   ├── houses.ts       # getHouse, getHouses, getLessonsForHouse
│   │   ├── progress.ts     # getProgress, markLessonComplete, getCompletedLessonIds
│   │   ├── lessons.ts      # getLesson, ensureLessonChunks (calls RAG index)
│   │   ├── rag.ts          # answerQuestion (uses MARE), indexLessonContent
│   │   ├── exam.ts         # generateExamQuestions, saveExamAttempt
│   │   └── profiles.ts     # getProfile, updateProfile, updateLanguage, updateOnboarding
│   │
│   ├── hooks/              # Data + behavior — no JSX
│   │   ├── useAuth.ts
│   │   ├── useHouse.ts     # house + lessons + progress for one house
│   │   ├── useLesson.ts    # lesson + completion + ensureChunks
│   │   ├── useExam.ts
│   │   └── useProfile.ts
│   │
│   ├── features/           # Feature-specific UI + minimal local state
│   │   ├── auth/
│   │   │   ├── SignInForm.tsx
│   │   │   └── SignUpForm.tsx
│   │   ├── house/
│   │   │   ├── HouseHeader.tsx
│   │   │   ├── HouseProgress.tsx
│   │   │   └── LessonList.tsx
│   │   ├── lesson/
│   │   │   ├── LessonContent.tsx
│   │   │   ├── LessonActions.tsx
│   │   │   └── QnAPanel.tsx
│   │   ├── exam/
│   │   │   ├── ExamQuestion.tsx
│   │   │   └── ExamResult.tsx
│   │   └── onboarding/
│   │       └── ... (from MentoriumOnboarding, reorganized)
│   │
│   ├── components/         # Shared, dumb UI only
│   │   ├── ui/             # Primitives from design system
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Text.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── layout/
│   │   │   ├── Screen.tsx
│   │   │   └── TabBar.tsx
│   │   └── ...
│   │
│   ├── theme/              # Single source of truth for look & feel
│   │   ├── tokens.ts       # Re-export or extend @mentorium/design-tokens
│   │   ├── ThemeProvider.tsx
│   │   └── useTheme.ts
│   │
│   └── i18n/               # Optional: separate from theme
│       ├── translations.ts
│       └── useTranslation.ts
│
├── services/               # Keep only if you need legacy wrappers (e.g. Sentry)
│   └── ...
└── ...
```

---

## Rules to avoid spaghetti

1. **Screens are thin**
   - `app/**/*.tsx`: route, maybe one layout; call one or two hooks; render feature components.
   - No `supabase.from(...)` in `app/`. No business logic (e.g. “ensure chunks”, “calculate progress”) in `app/`.

2. **One data layer: `src/api/`**
   - All Supabase (and any other HTTP) calls live under `src/api/`. Screens and hooks never import `supabase` directly; they use `getLesson`, `markLessonComplete`, etc.
   - Naming: `get*`, `create*`, `update*`, `delete*`, or clear verbs like `ensureLessonChunks`, `answerQuestion`.

3. **Logic in hooks, not in screens**
   - Data loading, derived state (e.g. progress %), and “orchestration” (e.g. load lesson then ensure chunks) live in `src/hooks/`. Screens call e.g. `const { lesson, loading, markComplete } = useLesson(lessonId)` and pass data/callbacks to feature components.

4. **Feature UI in `src/features/`**
   - One folder per feature (auth, house, lesson, exam, onboarding). Each can use `api/` or `hooks/` and `components/ui/`. No giant 300-line screen files; split into `HouseHeader`, `LessonContent`, `QnAPanel`, etc.

5. **Shared UI in `src/components/`**
   - Reusable, presentational components. Prefer `components/ui/` that take `theme` or use `useTheme()` so every screen looks consistent.

6. **One theme system**
   - All colors, spacing, typography come from `src/theme/` (and optionally `@mentorium/design-tokens`). No raw hex in screens or feature components. Dark/light and RTL live in the same theme/i18n layer.

7. **One place per concept**
   - One “house detail” flow (e.g. `house/[id].tsx` + `useHouse` + feature components). No duplicate “house” implemented with mock data in dashboard and real data in `house.tsx`. Dashboard can link to `house/[id]`.

8. **Consistent auth redirect**
   - Single rule: e.g. “if no session → signin; if session and no onboarding → onboarding; else → home”. Apply in one place (e.g. root layout or `(app)/_layout.tsx`), not differently from index vs signin.

---

## Example: lesson screen (target)

**`app/(app)/lesson/[id].tsx`** (thin):

```tsx
import { useLocalSearchParams } from 'expo-router';
import { useLesson } from '../../../src/hooks/useLesson';
import { LessonContent, LessonActions, QnAPanel } from '../../../src/features/lesson';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lessonId = Number(id);
  const { lesson, loading, completed, markComplete, error } = useLesson(lessonId);

  if (loading) return <LessonSkeleton />;
  if (error || !lesson) return <LessonError onBack={...} />;

  return (
    <Screen>
      <LessonContent lesson={lesson} completed={completed} />
      <QnAPanel lessonId={lessonId} />
      <LessonActions
        onPracticeQuiz={() => router.push(`/exam/${lessonId}`)}
        onMarkComplete={markComplete}
        completed={completed}
      />
    </Screen>
  );
}
```

**`src/hooks/useLesson.ts`** (data + logic):

- Calls `api/lessons.getLesson`, `api/progress.getProgress`, `api/lessons.ensureLessonChunks`, `api/progress.markLessonComplete`.
- Returns `{ lesson, loading, completed, markComplete, error }`.

**`src/api/lessons.ts`** (Supabase + RAG):

- `getLesson(id)`, `ensureLessonChunks(lessonId, content)` (uses RAG index), no UI.

This keeps screens short, logic testable, and data flow clear.

---

## Migration from current codebase

- **Keep**: `services/supabase.js` (move to `src/api/client.ts`), `services/auth.js` → `src/api/auth.ts`, `services/rag.js` → `src/api/rag.ts`, `services/exam.js` → `src/api/exam.ts`. Then replace direct Supabase in screens with `api/*` functions.
- **Extract**: All `supabase.from(...)` from `house.tsx`, `lesson/[id].tsx`, etc. into `src/api/houses.ts`, `progress.ts`, `lessons.ts`.
- **Introduce**: `useHouse`, `useLesson` that call those api functions; then refactor screens to use hooks + feature components.
- **Unify**: One theme (e.g. extend `LanguageContext` or new `ThemeProvider`) and use it everywhere; remove hardcoded colors from lesson, house, signin, index.
- **Single flow**: Decide “post-login = dashboard (tabs)” or “post-login = house list”; make index and signin both redirect to that same place. Replace duplicate “house detail” (dashboard mock vs house.tsx) with one `house/[id].tsx` + `useHouse(id)`.

Use **MIGRATION_ESSENTIALS.md** for the list of essential files to carry over; use this doc to **place** them in the new structure and add the rules above.

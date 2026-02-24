# Mentorium — UI direction for the next build

You don’t like the current UI and want to avoid it turning into a mess. This doc sets **one design system**, **clear UI principles**, and **practical steps** so the next build looks and feels consistent and maintainable.

---

## What’s wrong with the current UI (in short)

- **Inconsistent look**: Some screens dark (#171717), some cream (#EDE4D6), some use `LanguageContext` colors. No single “Mentorium” look.
- **Design tokens unused**: `@mentorium/design-tokens` and theme in LanguageContext exist but many screens use raw hex and local StyleSheets.
- **Dense and samey**: Lots of boxes, similar cards, similar typography → hard to scan and boring.
- **Mixed patterns**: Emoji tab bar in one place, SVG icons in another; different button and input styles.
- **No shared primitives**: Buttons and inputs recreated per screen → drift and spaghetti.

---

## Principle 1: One design system, one source of truth

- **Single theme** (e.g. `src/theme/`): colors, spacing, radii, typography (font sizes, weights). Dark/light if you want both.
- **All UI uses it**: No hex in screens or feature components. Use `useTheme()` or props from theme (e.g. `colors.background`, `spacing.md`).
- **Extend design tokens**: Keep `@mentorium/design-tokens` for primitives; in the app, map them into one `theme` object (and optional dark/light variants) so every component reads from the same place.

Example shape (you can tweak names):

```ts
// src/theme/tokens.ts (concept)
export const theme = {
  colors: {
    background: '...',
    surface: '...',
    primary: '...',
    primaryMuted: '...',
    text: '...',
    textMuted: '...',
    border: '...',
    success: '...',
    error: '...',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 4, md: 8, lg: 16 },
  typography: {
    title: { fontSize: 24, fontWeight: '700' },
    body: { fontSize: 16, lineHeight: 24 },
    caption: { fontSize: 13, ... },
  },
};
```

Every screen and shared component should get colors/spacing/type from this (or a wrapper like `useTheme()`), not from local constants or hex.

---

## Principle 2: Component-first UI

- **Shared primitives** in `src/components/ui/`: `Button`, `Input`, `Card`, `Text` (with variants), `ProgressBar`, etc. They take theme (or useTheme) and minimal props.
- **Screens and features compose these**: No one-off “big gray box with green border” defined inline in a screen. Use `<Card>`, `<Button variant="primary">`, etc.
- **Consistency**: Same padding, radius, and typography for the same type of thing (e.g. all “content cards” use the same Card, all primary actions the same Button).

That way “I hate this button” = change one component, not 10 files.

---

## Principle 3: Less clutter, clearer hierarchy

- **Fewer boxes**: Not every piece of info needs a card. Use spacing and typography (title vs body vs caption) to separate content; add borders/backgrounds only where it helps (e.g. one main content card per screen).
- **One main action per area**: Avoid multiple equal-weight buttons. Primary action (e.g. “Enter lesson”, “Mark complete”) clear; secondary (e.g. “Practice quiz”) visually lighter.
- **Obvious “what’s next”**: Home/dashboard should make it clear what the user should do next (e.g. one “Continue” or “Next lesson” block), not a wall of similar cards.
- **Whitespace**: Use theme spacing (e.g. `spacing.lg` between sections) so layout breathes and doesn’t feel cramped.

---

## Principle 4: Typography and rhythm

- **Few font sizes**: e.g. title (22–26), body (16), caption (12–13). Use weight (e.g. 600 for headings, 400 for body) and color (text vs textMuted) for hierarchy.
- **Same line-height for body**: e.g. 24 for 16px body so long lesson text is readable.
- **Stable vertical rhythm**: e.g. section spacing = `spacing.lg`; inside cards = `spacing.md`. Reuse the same values everywhere so the app doesn’t feel “patchy”.

---

## Principle 5: Accessible and robust

- **Touch targets**: Buttons and list rows at least 44pt height where possible.
- **Contrast**: Text on background passes WCAG AA (theme colors chosen once, then reused).
- **Loading and error states**: Every data-driven screen has a loading state (skeleton or spinner) and a simple error state (message + retry), using the same primitives (e.g. `Text`, `Button`).

---

## Suggested visual direction (taste)

You can keep “Mentorium” identity but simplify:

- **Dark-first (optional)**: One dark theme (e.g. dark gray background, light text, one accent like teal/mint) so it’s easy on the eyes and feels focused. Current mix of cream + dark is confusing.
- **One accent**: One main accent color for primary actions and key highlights (e.g. “Mark complete”, progress fill). Don’t mix several competing accent colors.
- **Flat and clear**: Prefer flat surfaces and subtle borders over heavy shadows and 3D. Clear hierarchy with type and spacing more than decoration.
- **RTL-ready**: Keep RTL in mind in layout (flex direction, text align) and use the same theme/i18n layer so en/ar both use the same components.

If you prefer light-only or a different mood, the important part is: **one theme, one set of primitives, no one-off styling in screens**.

---

## Onboarding

Onboarding should feel like a clear **welcome**, not a form dump. Align it with the same design system and entry logic.

- **Entry rule**: No session → signin; session and `onboarding_completed` false → onboarding; else → home/dashboard. Apply in one place (e.g. `index.tsx` or root layout).
- **One welcome path**: Prefer a single “Welcome to Mentorium” flow that explains what the app is and what they’ll do (houses, lessons, Q&A). “Returning user?” can be a secondary link, not the first question after signup.
- **Short and scannable**: Few steps; one main action per step; use theme typography and primitives (Button, Card, Text). No raw hex or one-off styles.
- **Clear progress**: Use the shared `ProgressBar` (or steps indicator) so users know how far they are. Optional: allow “Skip” for non-essential steps, but always persist `onboarding_completed` when they finish or skip.
- **Same theme**: Onboarding screens use `useTheme()` and shared components so the transition from onboarding → dashboard doesn’t feel like a different app.
- **i18n**: All onboarding copy via `t()`; support en/ar from the start if the rest of the app does.

In the next build, move onboarding into `src/features/onboarding/` and have the route only orchestrate; keep completion check and `markOnboardingCompleted` in the api/profile layer.

---

## Practical checklist for the next build

1. **Theme**
   - [ ] Add `src/theme/` with one `theme` (and optional dark/light).
   - [ ] Re-export or extend `@mentorium/design-tokens` there; no raw hex in app code.
   - [ ] `ThemeProvider` + `useTheme()` (or equivalent) and wrap the app.

2. **Primitives**
   - [ ] `Button` (e.g. primary / secondary / ghost), `Input`, `Card`, `Text` (title/body/caption), `ProgressBar`.
   - [ ] All use theme only; no hardcoded colors inside.

3. **Screens**
   - [ ] Every screen uses theme (no local hex) and composes primitives + feature components.
   - [ ] One clear “next step” on home/dashboard; reduced number of same-looking cards.

4. **Icons and nav**
   - [ ] Pick one approach: either a small icon set (e.g. SVG components in `components/ui/icons/`) or a single icon library. Use it for tab bar and actions everywhere.
   - [ ] Same tab bar component and same pattern for “back” / “settings”.

5. **Copy and i18n**
   - [ ] All user-facing strings via `t()` (or similar) from one place; support en/ar from the start if you need it.

6. **Onboarding**
   - [ ] Entry: session + !onboarding_completed → onboarding; then dashboard. Single place for this redirect.
   - [ ] Onboarding screens use theme + primitives only; one welcome path, clear progress, optional skip.
   - [ ] All copy via i18n; completion persisted to profile.

7. **Remove**
   - [ ] Drop dev-only UI (e.g. “Crash now” button) from production build.
   - [ ] Remove duplicate flows (e.g. mock house view) so one house flow uses one theme and one set of components.

---

## Summary

- **One theme** (colors, spacing, type) as single source of truth; no hex in screens.
- **Shared components** (Button, Card, Input, Text, ProgressBar, etc.) so UI is consistent and easy to change.
- **Less clutter**: fewer boxes, clear hierarchy, one main action per area, more whitespace.
- **Stable rhythm**: few font sizes, consistent spacing, clear loading/error states.
- **Onboarding**: one welcome path, theme-aligned, clear progress; entry rule in one place.

Use **ARCHITECTURE_NEXT.md** for where code lives (api, hooks, features, components); use this doc to decide **how** the UI looks and how to keep it from becoming spaghetti again.

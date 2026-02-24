# Mentorium Monorepo

Unified codebase for the Mentorium educational platform.

## Project Structure

- `mentorium-app/`: React Native (Expo) mobile application.
- `mentorium-web/`: React (web) application prototype.
- `MARE/`: Mentorium Automated Reasoning Engine (BKT + RAG).
- `ARG/`: **Current RAG** — newer RAG implementation (replaces legacy `RAG/`).
- `RAG/`: Legacy video RAG (Python); superseded by `ARG/`.
- `packages/design-tokens/`: Shared UI constants (colors, fonts, spacing).

## Quick Start

1. Install dependencies from the root:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Copy `.env.example` to `.env` in `mentorium-app`, `mentorium-web`, and `MARE`.

3. Run the projects:
   - **Mobile**: `npm run mobile`
   - **Web**: `npm run web`

## Security Note

Hardcoded credentials have been removed. Always use `.env` files for Supabase and OpenAI keys. Ensure `.env` files are not committed to version control.

## Integration

The mobile app now uses `MARE` for RAG reasoning and student diagnostic tracking. UI consistency is maintained via the `@mentorium/design-tokens` package.

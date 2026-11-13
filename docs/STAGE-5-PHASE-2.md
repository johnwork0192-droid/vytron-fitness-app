# Stage 5 Phase 2 — Supabase Authentication and Sync

## Setup
1. Create a Supabase project; run migrations in order: `20261113090000_initial_schema.sql`, then `20261113100000_cloud_sync_keys.sql`.
2. Add frontend build variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Supabase publishable/anon key only). No URL/key is fabricated in this repository.
3. Configure Supabase Auth email confirmation, app URL and redirect allowlist for `/` on your deployed domain.
4. Configure server-only Vercel environment values: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `OPENAI_API_KEY`; optional `OPENAI_MODEL`. Set client build `VITE_AI_MODE=real` to activate authenticated AI. The OpenAI key must never have a `VITE_` prefix.
5. Deploy to Vercel or another Node serverless host with same-origin `/api/coach/chat`. Static-only deployment cannot execute the API route.

## Features
Sign-up, sign-in, email confirmation, password reset link and sign-out are real Supabase Auth operations. Account access is opened from the dashboard profile row. When configured and authenticated, Coach obtains the current Supabase access token and sends it as a Bearer token. Authenticated accounts load and save profile, chat, plans, workout sessions and body metrics through RLS-protected Supabase queries. Signed-out, unconfigured and default installations retain local storage and the honest DEMO coach.

## Cloud and account safety
The browser only uses the public anon key; RLS policies scope records to `auth.uid()`. Session persistence/refresh is managed by supabase-js. Password reset uses Supabase's email flow. Apply SQL migrations before enabling cloud features. Cloud synchronization cannot be validated until owner credentials and a deployed Supabase project exist. Client-local data is not automatically migrated on first sign-in; remote account data is loaded for that account.

## Verification
`npm test` executes focused unit tests for workout plan generation and approximate nutrition helpers. `npm run build` runs strict TypeScript and the Vite production build. GitHub Actions status must be checked after this commit is pushed.

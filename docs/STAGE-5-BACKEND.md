# Stage 5 — backend and real AI setup

## Phase 1: server foundation (implemented)

- Supabase schema migration creates private user profiles, coach message history, workout plans, workout sessions and body metrics. RLS restricts every row to its owning authenticated user.
- `POST /api/coach/chat` is a Vercel Node serverless function. It rejects non-POST requests, requires a valid Supabase access token, limits user message/context sizes, sends only bounded recent fitness context to OpenAI, and persists both turns through RLS. The OpenAI key is read only from the server environment. Errors do not expose provider credentials or raw provider output to clients.
- Frontend Supabase client factory reads only the project URL and publishable/anon key. These are public client configuration; database RLS is the security boundary. Do not place service-role or model keys in frontend `VITE_*` settings.

## Owner setup required

1. Create a Supabase project and run `supabase/migrations/20261113090000_initial_schema.sql` in the SQL editor or using Supabase CLI.
2. In hosting frontend build environment set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_AI_MODE=real`.
3. In the serverless function environment set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `OPENAI_API_KEY`, and optionally `OPENAI_MODEL`. Never expose `OPENAI_API_KEY` as a `VITE_*` variable.
4. Deploy this Vite application and `api/coach/chat.ts` to a Node-compatible Vercel project so `/api/coach/chat` is same-origin. A static-only host cannot run this API; deploy the function on an equivalent Node serverless backend and configure a same-origin route/proxy.
5. Configure Supabase Auth email/redirect URLs and production app domains. Add rate limiting/abuse monitoring at the hosting edge before public launch; serverless in-memory rate limiters are not reliable across instances.

## Current stage boundary

This commit lays down a real, credential-secure backend path and private cloud schema. Real AI is not operational until the owner configures provider and Supabase credentials and deploys the function. Cloud auth UI and synchronization of profiles/plans/session history are the next integration phase; the existing browser-local DEMO remains functional in the meantime.

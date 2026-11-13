# VYTRON AI Coach integration

The Stage 3 coach is integrated into the existing Vite/React application through the AI Coach sidebar item. It uses the existing exercise catalogue, opens the existing Workouts studio, and persists the coach profile, messages, plans and sample workout logs in browser localStorage (`vytron-ai-coach-v1`). The local storage adapter is intentionally replaceable with Supabase; do not treat browser storage as cross-device or authenticated storage.

## Run and verify

```sh
npm install
npm run build
npm run dev
```

Open AI Coach from the sidebar, switch RU/EN, ask a quick question, generate/save a HOME or GYM plan, and review the nutrition estimates. The default `VITE_AI_MODE` is `demo`: rule-based contextual guidance that is expressly labelled as a demo, not a language model. It includes a safety response for health/pain/injury wording. Nutrition is an approximate estimate, not medical advice.

## Secure real-model adapter

Set `VITE_AI_MODE=real` to call the same-origin `POST /api/coach/chat` adapter. This frontend intentionally has no provider key and will show a service error if the endpoint is not deployed. Implement the route in a trusted server/runtime: validate and rate-limit input, authenticate users, apply safety policy, call your selected model with its key in server environment secrets, constrain response size, and return `{ "reply": "..." }`. Never expose the provider key in `VITE_*` variables or client bundles. Deploy a compatible serverless function or backend proxy and configure the provider key there.

## Storage evolution

Replace `loadCoachStore` / `saveCoachStore` with an authenticated Supabase repository when credentials and RLS policies are provisioned. Suggested tables: `profiles`, `coach_messages`, `workout_plans`, `workout_sessions`, and `body_metrics`; scope each row to `auth.uid()`, enable RLS, and keep service-role credentials server-side. Local data stays on this device and is not synced.

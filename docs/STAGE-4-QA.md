# VYTRON FITNESS — Stage 4 QA notes

## Build and verification

The project uses the existing GitHub Actions workflow (`.github/workflows/build.yml`) to run `npm install` and `npm run build` on pushes and pull requests targeting `feature/vytro-fitness-mvp`. A local terminal is not available in this integration environment; use the branch workflow run as the authoritative TypeScript/production build result. The application build is `tsc -b && vite build`; TypeScript `strict` remains enabled.

## Integration checks

- AI Coach and the 3D training studio remain separate overlays mounted alongside the dashboard. The existing sidebar actions open their respective overlays; Coach's saved plan CTA routes into the existing Workouts entry.
- Coach profile, chat, plan and session state use the existing `vytron-ai-coach-v1` localStorage key. Loading now tolerates malformed/partial saved records and storage exceptions.
- Nutrition calculations guard profile measurements and remain explicitly approximate.
- Responsive rules for desktop/tablet/mobile remain in `src/features/coach/coach.css`; the existing training styles are untouched.
- There is no configured automated unit/component test command or browser/device test suite in the current package. GitHub Actions validates strict TypeScript and the production Vite build, not end-to-end behavior.

## Deployment prerequisites / current limitations

- Real AI requires a same-origin `POST /api/coach/chat` backend, model provider credentials held in server secrets, and server-side validation/rate limits. The client never contains a provider key. The frontend is rule-based DEMO by default.
- User data currently remains local to the browser; Supabase authentication, RLS schema and cross-device sync need project credentials and backend configuration.
- Dashboard Progress and profile/auth are not yet independent full screens in the existing application; this QA step does not replace them with mock pages. Coach currently exposes its own activity log/profile inputs.

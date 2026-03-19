# Inner Sleep MVP Launch Status

Date: 2026-03-16

## Scope policy applied
- No new product features added for this pass.
- Only blocker fixes and MVP launch hardening were applied.

## 1) What works (code-level verified)

### Core flow
- Auth routes exist and are connected:
  - `/login`
  - `/wachtwoord-vergeten`
  - `/reset-wachtwoord`
- Pricing page exists and starts checkout from plan buttons:
  - `/pricing` -> `POST /api/checkout`
- Checkout endpoint creates Stripe subscription sessions:
  - `mode: 'subscription'`
  - `success_url` -> `/app?checkout=success&session_id={CHECKOUT_SESSION_ID}`
  - `cancel_url` -> `/pricing`
  - `trial_period_days: 7`
- Webhook routing exists:
  - Preferred: `/api/webhooks/stripe`
  - Backward-compatible: `/api/webhook`
- Webhook handler covers required events:
  - `checkout.session.completed`
  - `invoice.paid`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Gated access logic exists and is active:
  - Protected routes require auth/access
  - `/app` checks subscription status and paywall state
  - Recovery path after Stripe return via session id exists

### Audio playback
- Standard voice sources configured:
  - Female: `/audio/build/female-final/outputs/female-full-100-with-themed-silence.m4a`
  - Male: `/audio/build/male-final/outputs/male-full-100-with-themed-silence.m4a`
- 60-minute behavior in player exists:
  - Voice loops
  - Session stop timer at 60 minutes
- Mix levels are set exactly to requested values:
  - Voice `1.0`
  - Breathing `0.15`
  - Music `0.05`

### Desktop/mobile navigability
- Global nav present with core routes.
- Extra return links were added on pages that could feel like dead ends (privacy/voorwaarden/success/reset flows).

### Analytics
- Server event tracking available (`app/lib/analytics.ts`).
- Supports PostHog when configured.
- Supports GA4 browser tag and optional server event mirror when configured.

## 2) What was fixed in this blocker pass

1. Vercel build blockers
- Removed `useSearchParams()` usage from pages that caused prerender failures (`/login`, `/pricing`) by switching to `window.location.search` on client side.

2. Middleware runtime blocker
- Added fail-safe in `middleware.ts` so missing Supabase env does not crash middleware invocation.
- Public routes continue; protected routes redirect to `/login` when env/auth is unavailable.

3. Checkout error visibility
- Pricing now surfaces real backend error text from `/api/checkout`.
- `/api/checkout` now returns clearer Stripe error details instead of only generic text.

4. Login/account visibility blocker
- Header now clearly shows logged-in state (`Ingelogd: <email>`) or `Inloggen` button.

## 3) Optional (not required for MVP launch)
- ElevenLabs production runtime TTS (kept optional; standard playback uses pre-generated audio).
- Audio tuning improvements (voice flavor, breathing/music refinement).
- Advanced audio protection/hardening.
- Middleware-to-proxy migration (Next warning only, not a launch blocker today).

## 4) Current blocker before declaring FULL DONE in production

### Blocking operational issue (from live logs)
- Production logs showed:
  - `Your project's URL and Key are required to create a Supabase client!`
- This indicates missing/incorrect Supabase public env vars in Vercel production.

Required production env vars (minimum):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## 5) Launch readiness conclusion

### Codebase status
- MVP code is in launch-ready shape for the defined scope.
- No additional feature work is required for MVP launch.

### Go-live status
- **Not fully DONE yet** until production env mismatch is corrected and one live E2E verification succeeds.

## 6) Final launch verification checklist (must pass once)

1. Signup/login works on `inner.help`.
2. Pricing button (`€4.99`) opens Stripe checkout.
3. Successful payment returns to `/app`.
4. Webhook updates subscription status to active/trialing.
5. Gated access allows subscribed user and blocks unsubscribed user.
6. Female and male audio both play.
7. 60-minute session behavior works.
8. Desktop + mobile checks pass.

When all 8 pass in production, MVP is DONE and launchable.

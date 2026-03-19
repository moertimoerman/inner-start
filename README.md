This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

1. Duplicate `.env.local.example` to `.env.local`.
2. Fill in your Supabase, Stripe, and ElevenLabs keys.
3. Restart the dev server after each key change.

### Standard Audio (Production MVP)

Standard playback does not require runtime TTS. It reuses pre-generated files:

- `public/audio/standard/female.m4a`
- `public/audio/standard/male.m4a`

If one of these files is missing, the player shows a clear error and logs the missing path in the console.

### ElevenLabs Notes

- `ELEVENLABS_API_KEY` is required for `/api/voice` (server-only, never `NEXT_PUBLIC`).
- `ELEVENLABS_VOICE_ID_FEMALE` is recommended as default voice path.
- `ELEVENLABS_VOICE_ID` is generic fallback voice id.
- `ELEVENLABS_VOICE_ID_MALE` is optional for setup voice toggle.
- If `/api/voice` returns `401/403`, rotate and replace your ElevenLabs key in `.env.local`.
- If `/api/voice` returns `404`, your `ELEVENLABS_VOICE_ID` is invalid for your account.

For standard app playback only:
- `ELEVENLABS_*` env vars are not required.
- They are only needed for `/test-voice` and future premium runtime generation.

## Vercel Env Setup (Security)

Add these in Vercel Project Settings -> Environment Variables.

Server-only (must never be exposed in frontend code):
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ELEVENLABS_API_KEY`
- `POSTHOG_API_KEY` (if used)
- `GA4_MEASUREMENT_ID` (if server-side GA4 mirror is used)
- `GA4_API_SECRET` (if server-side GA4 mirror is used)

Public (safe as `NEXT_PUBLIC_*`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (if GA4 browser tracking is used)

Stripe checkout source of truth:
- `/api/checkout` resolves prices server-side only from:
  - `STRIPE_PRICE_STANDARD_MONTHLY`
  - `STRIPE_PRICE_STANDARD_YEARLY`
  - `STRIPE_PRICE_PREMIUM_MONTHLY`
  - `STRIPE_PRICE_PREMIUM_YEARLY`

Current live IDs:
- `STRIPE_PRICE_STANDARD_MONTHLY=price_1TAsIPEIVa7nIrkaPOAbHTSk`
- `STRIPE_PRICE_STANDARD_YEARLY=price_1TAsIQEIVa7nIrkaeZ2N3Olp`
- `STRIPE_PRICE_PREMIUM_MONTHLY=price_1TAsIOEIVa7nIrkaif5wWa0E`
- `STRIPE_PRICE_PREMIUM_YEARLY=price_1TAsILEIVa7nIrkaKLSgxKCj`

Voice ids (not API secrets, but keep managed via env):
- `ELEVENLABS_VOICE_ID_FEMALE` (default path)
- `ELEVENLABS_VOICE_ID` (fallback)
- `ELEVENLABS_VOICE_ID_MALE` (optional)

Rules:
- Never commit `.env.local` or real secrets to GitHub.
- Never rename secret keys to `NEXT_PUBLIC_*`.
- Keep checkout/session creation, subscription access checks, webhook handling, and ElevenLabs API calls on server routes only.

### Voice Debug + Standard Track Flow (MVP)

Use `/test-voice` in this order:

1. Click `Check ElevenLabs key permissions` (GET `/api/voice` auth check).
2. Click `Build standard script preview` (GET `/api/voice?mode=script`).
3. Click `Generate standard chunk` (POST `/api/voice`) to synthesize one chunk.

Notes:
- Standard track generation currently supports active languages `nl` and `en`.
- Planned later languages are prepared in code: `fr`, `de`, `es`, `it`, `sv`, `da`, `no`.
- Long 30-45 minute tracks are generated as chunks for reliability.

### Low-Cost Dutch Pacing Test

On `/test-voice` there is a separate low-cost Dutch sentence workflow:

1. Click `Generate Dutch Sentence Test Set` to generate 8 short Dutch clips.
2. Click `Play pacing sequence` to play sentence clips with reusable silence assets.
3. Click `Play 2-minute prototype` to repeat the same cheap sequence up to ~2 minutes without new TTS calls.
4. Optionally toggle `Music layer` and `Breathing layer (4-in / 6-out)` for layered playback testing.

Why this is cheap:
- Sentence-level clips are generated once and then reused.
- Silence is reused from static assets (`/audio/silence3s.m4a`, `/audio/silence7s.m4a`) instead of spending TTS credits on pause text.
- Server-side clip caching stores identical sentence requests and reuses them (you can see cache hits/misses on the test page).

Layer architecture:
- Voice layer: sentence clips + silence assets
- Breathing layer: generated breathing loops (`/audio/breathing/breathing-01.m4a` ... `breathing-10.m4a`) with 4s inhale / 6s exhale feel
- Music layer: ambient bed (`/audio/ambience.mp3`) plus subtle 432Hz harmonic synth layer (less monotone than a pure tone)

### Breathing Loop Generator (Automated)

Generate 10 breathing loop files automatically:

```bash
node scripts/generate-breathing-loops.mjs
```

Outputs:
- `public/audio/breathing/breathing-01.m4a` ... `breathing-10.m4a`
- AAC M4A, mono, 44.1kHz, ~64kbps, 10 seconds each

Playback levels in test page:
- Music layer is kept below voice to avoid masking speech.
- Breathing layer is set around `-18 dB` vs voice (within `-15` to `-22 dB` target).

### Generate Standard Sentence Clips (M4A, per sentence)

You can generate Dutch sentence clips directly from ElevenLabs and save each sentence as `.m4a`:

```bash
npm run generate:standard:sentences -- --voice female --language nl
npm run generate:standard:sentences -- --voice male --language nl
```

Output folders:
- `public/audio/standard/sentences/nl/female/`
- `public/audio/standard/sentences/nl/male/`

### Build Final Track With Real 4s Silence (Offline)

Use the offline ffmpeg pipeline to render one final `.m4a` with physically inserted 4.0s silence between each sentence clip:

```bash
npm run build:audio:track -- --input-dir public/audio/standard/sentences/nl/female --contains FemaleNL1 --output-name female-nl1-with-4s
npm run build:audio:track -- --input-dir public/audio/standard/sentences/nl/female --contains FemaleNL3 --output-name female-nl3-with-4s
npm run build:audio:track -- --input-dir public/audio/standard/sentences/nl/male --contains MaleNL1 --output-name male-nl1-with-4s
npm run build:audio:track -- --input-dir public/audio/standard/sentences/nl/male --contains MaleNL3 --output-name male-nl3-with-4s
```

Outputs:
- Final files: `public/audio/build/outputs/<output-name>.m4a`
- Normalized clips + concat list + report: `public/audio/build/normalized/<output-name>/`

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

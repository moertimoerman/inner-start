# Inner Sleep MVP — status

Datum: 30 september 2026.

## Code

- Standard-only checkout.
- Clerk-auth geïntegreerd; publieke pagina's blijven buildbaar zonder keys.
- Stripe is de bron voor toegang; dubbele actieve abonnementen worden geblokkeerd.
- Stripe Customer Portal voor online beheren en opzeggen.
- Beide stemmen gekoppeld aan een beschermde audio-route.
- Productieaudio voorbereid voor Vercel Private Blob.
- Openbare audiopaden en runtime-TTS zijn in productie dichtgezet.
- Analyticscookies en onbewezen sociale claims verwijderd.
- CI, lint, tests en productiebuild beschikbaar via `npm run check`.

## Nog niet live geverifieerd

- Clerk-, Stripe-, Blob-, Vercel- en GitHub-accounttoegang.
- Testcheckout en live checkout.
- Webhook in het echte Stripe-account.
- Audio-upload naar de productie-Blob store.
- Browsercontrole met een ingelogde abonnee op mobiel en desktop.

De MVP is pas live-af wanneer alle punten uit `docs/LAUNCH-RUNBOOK.md` onder “Verplichte eindcontrole” zijn afgevinkt.

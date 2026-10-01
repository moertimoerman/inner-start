# Inner Sleep — handover

Laatst bijgewerkt: 30 september 2026.

## Productbesluiten

- Launch: alleen Standard, €4,99 per maand of €39,99 per jaar, 7 dagen proef.
- Audio: vooraf gerenderd, één vrouwenstem en één mannenstem; vrouwenstem is standaard.
- Nederlands eerst. De bestaande `app/lib/affirmations`-indeling kan later per taal worden uitgebreid.
- Volume, tempo en stemkwaliteit worden na de MVP verder afgestemd.
- Premium wordt pas zichtbaar zodra er werkelijk premiumfunctionaliteit bestaat.

## Architectuur

- Next.js 16 / React 19.
- Clerk voor accounts.
- Stripe voor checkout, abonnementen, toegang en Customer Portal.
- Clerk private metadata bewaart alleen `stripeCustomerId`.
- Vercel Private Blob voor audio; `/api/audio/[track]` controleert Stripe-toegang.
- Geen database voor de MVP.
- ElevenLabs alleen offline voor nieuwe renders; `/api/voice` is in productie uitgeschakeld.

## Belangrijkste routes

- Publiek: `/`, `/pricing`, `/privacy`, `/voorwaarden`, `/login`, `/registreren`.
- Beschermd: `/dashboard`, `/app`, `/setup`.
- Integraties: `/api/checkout`, `/api/billing-portal`, `/api/webhooks/stripe`, `/api/audio/[track]`.

## Operationele status

De code kan zonder echte keys worden gelint, getest en gebouwd. Voor publicatie ontbreken nog accounttoegang, dashboardconfiguratie, private Blob-upload en een test- en live-E2E-controle. Volg `docs/LAUNCH-RUNBOOK.md`.

# Inner Sleep

Nederlandstalige MVP voor een rustige luisterroutine voor het slapengaan.

## MVP-scope

- Standard-abonnement, maandelijks of jaarlijks, met 7 dagen proef.
- Eén vrouwenstem en één mannenstem.
- Instelbare stemkeuze en drie audiobalansen.
- Accounts via Clerk.
- Abonnement en online opzeggen via Stripe Checkout en Customer Portal.
- Abonnementsstatus rechtstreeks uit Stripe; geen database vereist.
- Audio via een afgeschermde route en Vercel Private Blob in productie.
- Nederlands als eerste taal. De audio- en tekststructuur houdt ruimte voor extra talen en Premium.

Premium en runtime-TTS zijn bewust niet verkoopbaar in deze MVP.

## Lokaal starten

```bash
npm install
cp .env.example .env.local
npm run dev
```

Zonder accountkeys blijven de publieke pagina's werken en toont `/login` een configuratiemelding. Beschermde routes blijven fail-closed.

## Controle

```bash
npm run check
```

Dit draait lint, unit tests en de productiebuild.

## Audio

Lokale ontwikkeling gebruikt de bestaande bestanden in `public/audio`. Productie gebruikt Vercel Private Blob. Nadat een private Blob store gekoppeld is en `BLOB_READ_WRITE_TOKEN` lokaal beschikbaar is:

```bash
npm run upload:audio
```

De upload gebruikt vaste paden onder `audio/nl/`. De browser krijgt de Blob-URL nooit te zien; `/api/audio/[track]` controleert eerst account én Stripe-toegang.

## Configuratie

Zie [.env.example](./.env.example) en [docs/LAUNCH-RUNBOOK.md](./docs/LAUNCH-RUNBOOK.md). Zet echte sleutels uitsluitend in `.env.local`, Vercel Environment Variables of de betreffende dashboard-integratie. Commit ze nooit.

## Audioproductie

De bestaande rendercommando's blijven beschikbaar:

```bash
npm run build:female:final-track
npm run build:male:final-track
```

ElevenLabs is alleen nodig wanneer de stemmen later opnieuw worden geproduceerd. Klantplayback gebruikt vooraf gerenderde audio en verbruikt geen ElevenLabs-credits.

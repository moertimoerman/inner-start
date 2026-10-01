# Inner Sleep MVP — launch runbook

Laatst bijgewerkt: 30 september 2026.

De code kan zonder dashboards lokaal worden gebouwd. Publicatie en een echte end-to-end betaling wachten op herstel of aanmaak van de onderstaande accounts. Deel geen wachtwoorden of geheime sleutels met een assistent.

## Gekozen stack

| Onderdeel | Keuze | Reden |
|---|---|---|
| App en hosting | Next.js 16 + Vercel Pro | Bestaande app behouden; eenvoudige previews en productiehosting |
| Accounts | Clerk | Voorgebouwde account- en herstelstromen; geen eigen auth-database |
| Betalen | Stripe | Checkout, abonnementen, facturen en online opzeggen via Customer Portal |
| Audiobestanden | Vercel Private Blob | Audio is niet rechtstreeks openbaar; toegang loopt via de app |
| Stemproductie | ElevenLabs, alleen offline | Geen runtime-kosten of misbruik in de klantapp |
| Database | Geen voor MVP | Stripe is de bron voor abonnementsstatus; Clerk bewaart alleen het Stripe customer-id |

Supabase is voor deze MVP niet meer nodig. Premium blijft in de domeinstructuur voorbereid, maar wordt niet aangeboden totdat de extra waarde echt bestaat.

## Accounts herstellen of aanmaken

1. Herstel toegang tot GitHub en controleer repository `moertimoerman/inner-start`.
2. Herstel toegang tot Vercel, kies een commercieel geschikt plan en koppel de repository.
3. Installeer Clerk via de Vercel Marketplace of maak een Clerk-app aan. Zet de productie-URL's voor inloggen en registreren op `/login` en `/registreren`.
4. Herstel Stripe en controleer bedrijfsverificatie en uitbetalingsrekening.
5. Maak in Stripe één Standard-product met een maandprijs van €4,99 en jaarprijs van €39,99. Noteer beide `price_...`-id's.
6. Activeer en configureer Stripe Customer Portal zodat klanten zelf kunnen opzeggen.
7. Maak een private Vercel Blob store en koppel die aan het project.

## Environment variables

Gebruik `.env.example` als namenlijst. Belangrijk:

- Alle Stripe-waarden moeten uit dezelfde test- of live-modus komen.
- Gebruik eerst testmodus voor de volledige flow.
- Zet `NEXT_PUBLIC_APP_URL` in productie exact op `https://inner.help`.
- `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` en `BLOB_READ_WRITE_TOKEN` zijn server-only.
- ElevenLabs-waarden zijn niet nodig voor productieplayback.

## Stripe webhook

Maak één endpoint:

```text
https://inner.help/api/webhooks/stripe
```

Minimaal event:

```text
checkout.session.completed
```

De webhook koppelt het Stripe customer-id aan het Clerk-account. Toegang zelf wordt rechtstreeks bij Stripe gecontroleerd, waardoor vertraagde webhooks geen onjuiste database-status kunnen achterlaten.

## Audio publiceren

Nadat Blob gekoppeld is:

```bash
npm run upload:audio
```

Controleer dat vier private objecten bestaan: vrouwenstem, mannenstem, ambience en breathing. De vrouwenstem is de standaardkeuze; beide stemmen zijn beschikbaar.

## Veilige publicatievolgorde

1. Voeg testkeys en test-price-id's toe aan Vercel Preview.
2. Deploy een preview en voer de checklist hieronder uit met een Stripe testkaart.
3. Voeg live keys, live-price-id's en het live webhook-secret toe aan Production.
4. Upload audio naar de productie-Blob store.
5. Deploy productie.
6. Voer pas na expliciete bevestiging één echte betaling uit en zeg die via het klantportaal weer op.

## Verplichte eindcontrole

- Registreren, inloggen, uitloggen en wachtwoordherstel werken.
- Niet-ingelogde gebruikers bereiken `/app` en audio niet.
- Een ingelogde gebruiker zonder abonnement ziet de betaalmuur.
- Maand- en jaarcheckout gebruiken de juiste Standard-prijs.
- Een gebruiker kan geen tweede actief abonnement aanmaken.
- Een proefabonnement krijgt toegang tot `/app`.
- De vrouwen- en mannenstem spelen; de drie mixen zijn hoorbaar verschillend.
- Oude openbare `/audio/...`-links geven 404.
- Opzeggen via Dashboard → Stripe Customer Portal werkt.
- Mobiele en desktopweergave hebben geen console- of serverfouten.

## Nog door de eigenaar te bevestigen

- Officiële juridische naam, KvK-nummer en eventuele btw-gegevens voor voorwaarden/facturatie.
- Of het gepubliceerde correspondentieadres en `contact@inner.help` actueel zijn.
- Definitieve live Stripe-prijzen en bedrijfsverificatie.
- Definitieve klank, volume en tempo van beide stemmen; dit is bewust werk ná de MVP.

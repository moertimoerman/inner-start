import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { trackServerEvent } from '../../lib/analytics'
import { VALID_PRICE_IDS } from '../../lib/pricing'

let stripeClient: Stripe | null = null

function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) return null

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2026-02-25.clover',
    })
  }

  return stripeClient
}

function getKeyMode(secretKey: string | undefined) {
  if (!secretKey) return 'missing'
  if (secretKey.startsWith('sk_live_')) return 'live'
  if (secretKey.startsWith('sk_test_')) return 'test'
  return 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY
    const keyMode = getKeyMode(secretKey)

    if (process.env.NODE_ENV === 'production' && keyMode === 'test') {
      console.error('CHECKOUT_KEY_MODE_ERROR: production draait met sk_test key.')
      return NextResponse.json(
        {
          error:
            'Checkout staat op Stripe TEST mode. Zet in Vercel STRIPE_SECRET_KEY op een sk_live sleutel.',
          keyMode,
        },
        { status: 500 }
      )
    }

    const stripe = getStripeClient()
    if (!stripe) {
      console.error('CHECKOUT_CONFIG_ERROR: STRIPE_SECRET_KEY ontbreekt.')
      return NextResponse.json(
        { error: 'Serverconfiguratie ontbreekt: STRIPE_SECRET_KEY.' },
        { status: 500 }
      )
    }

    const { priceId, email, userId } = await request.json()

    if (!priceId || !email) {
      return NextResponse.json(
        { error: 'priceId en email zijn verplicht.' },
        { status: 400 }
      )
    }

    if (!VALID_PRICE_IDS.has(priceId)) {
      return NextResponse.json(
        { error: 'Ongeldige priceId voor checkout.' },
        { status: 400 }
      )
    }

    // Manual dashboard requirement:
    // Stripe Price IDs in app/lib/pricing.ts must exist in your Stripe account.

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      // Include checkout session id so /app can recover access if webhook sync is delayed.
      success_url: `${request.nextUrl.origin}/app?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/pricing`,
      subscription_data: {
        trial_period_days: 7,
      },
      metadata: {
        user_id: userId || '',
        email,
        price_id: priceId,
      },
    })

    await trackServerEvent({
      event: 'checkout_start',
      distinctId: userId || email,
      properties: {
        priceId,
        sourcePath: '/pricing',
        stripeSessionLiveMode: session.livemode,
        stripeKeyMode: keyMode,
      },
    })

    // Temporary debug payload for launch validation.
    return NextResponse.json({
      url: session.url,
      debug: {
        priceId,
        liveMode: session.livemode,
        keyMode,
        checkoutMode: 'subscription',
        usesSetupIntentFlow: false,
      },
    })
  } catch (error) {
    console.error('Stripe error:', error)
    const stripeMessage =
      error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: unknown }).message ?? '')
        : ''
    return NextResponse.json(
      {
        error: stripeMessage
          ? `Checkout kon niet starten: ${stripeMessage}`
          : 'Checkout kon niet starten door een serverfout.',
      },
      { status: 500 }
    )
  }
}

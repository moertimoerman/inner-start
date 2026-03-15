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

export async function POST(request: NextRequest) {
  try {
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
      },
    })

    return NextResponse.json({ url: session.url })
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

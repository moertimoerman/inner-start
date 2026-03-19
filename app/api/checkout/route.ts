import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { trackServerEvent } from '../../lib/analytics'
import {
  getCheckoutPriceId,
  type BillingInterval,
  type PlanKey,
} from '../../lib/pricing'

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

    const { plan, interval, email, userId } = await request.json()

    if (!plan || !interval || !email) {
      return NextResponse.json(
        { error: 'plan, interval en email zijn verplicht.' },
        { status: 400 }
      )
    }

    const validPlan = plan === 'standard' || plan === 'premium'
    const validInterval = interval === 'monthly' || interval === 'yearly'

    if (!validPlan || !validInterval) {
      return NextResponse.json(
        { error: 'Ongeldige plan/interval combinatie voor checkout.' },
        { status: 400 }
      )
    }

    const selectedPlan: PlanKey = plan
    const selectedInterval: BillingInterval = interval
    const priceId = getCheckoutPriceId(selectedPlan, selectedInterval)

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
        plan: selectedPlan,
        billing_interval: selectedInterval,
      },
    })

    await trackServerEvent({
      event: 'checkout_start',
      distinctId: userId || email,
      properties: {
        priceId,
        plan: selectedPlan,
        interval: selectedInterval,
        sourcePath: '/pricing',
        stripeSessionLiveMode: session.livemode,
        stripeKeyMode: keyMode,
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

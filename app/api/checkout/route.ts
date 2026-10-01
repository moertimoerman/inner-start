import { NextRequest, NextResponse } from "next/server";
import { getInnerUser, saveStripeCustomerId } from "../../lib/auth";
import { getAppUrl, isClerkConfigured } from "../../lib/config";
import {
  getCheckoutPriceId,
  isBillingInterval,
  MVP_PLAN,
} from "../../lib/pricing";
import { getStripeClient, getStripeKeyMode } from "../../lib/stripe";
import { subscriptionBlocksCheckout } from "../../lib/subscription-policy";

export async function POST(request: NextRequest) {
  try {
    if (!isClerkConfigured()) {
      return NextResponse.json(
        { error: "Inloggen is nog niet geconfigureerd." },
        { status: 503 }
      );
    }

    const user = await getInnerUser();
    if (!user) {
      return NextResponse.json(
        { error: "Log eerst in om de proefperiode te starten.", loginUrl: "/login?next=/pricing?checkout=1" },
        { status: 401 }
      );
    }

    const keyMode = getStripeKeyMode();
    if (process.env.NODE_ENV === "production" && keyMode !== "live") {
      console.error("CHECKOUT_KEY_MODE_ERROR", { keyMode });
      return NextResponse.json(
        { error: "Betalen is tijdelijk niet beschikbaar." },
        { status: 503 }
      );
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json(
        { error: "Betalen is nog niet geconfigureerd." },
        { status: 503 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      interval?: unknown;
    };
    if (!isBillingInterval(body.interval)) {
      return NextResponse.json(
        { error: "Kies een geldig maand- of jaarabonnement." },
        { status: 400 }
      );
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.firstName ?? undefined,
        metadata: { clerk_user_id: user.id },
      });
      customerId = customer.id;
      await saveStripeCustomerId(user.id, customerId);
    }

    const existingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 100,
    });
    const activeSubscription = existingSubscriptions.data.find((subscription) =>
      subscriptionBlocksCheckout(subscription.status)
    );

    if (activeSubscription) {
      return NextResponse.json(
        {
          error: "Je hebt al een abonnement. Beheer dit via je dashboard.",
          dashboardUrl: "/dashboard",
        },
        { status: 409 }
      );
    }

    const appUrl = getAppUrl(request.nextUrl.origin);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      line_items: [
        {
          price: getCheckoutPriceId(MVP_PLAN, body.interval),
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/app?checkout=success`,
      cancel_url: `${appUrl}/pricing`,
      allow_promotion_codes: true,
      subscription_data: {
        ...(existingSubscriptions.data.length === 0 ? { trial_period_days: 7 } : {}),
        metadata: {
          clerk_user_id: user.id,
          plan: MVP_PLAN,
          billing_interval: body.interval,
        },
      },
      metadata: {
        clerk_user_id: user.id,
        plan: MVP_PLAN,
        billing_interval: body.interval,
      },
    });

    if (!session.url) {
      throw new Error("Stripe returned no checkout URL.");
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("CHECKOUT_ERROR", error);
    return NextResponse.json(
      { error: "Checkout kon niet starten. Probeer het later opnieuw." },
      { status: 500 }
    );
  }
}

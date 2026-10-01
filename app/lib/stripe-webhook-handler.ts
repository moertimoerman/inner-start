import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { saveStripeCustomerId } from "./auth";
import { getStripeClient } from "./stripe";

export async function handleStripeWebhook(request: NextRequest) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!stripe || !webhookSecret) {
    console.error("WEBHOOK_CONFIG_ERROR");
    return NextResponse.json(
      { error: "Webhook is niet geconfigureerd." },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error("WEBHOOK_SIGNATURE_ERROR", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id ?? session.metadata?.clerk_user_id;
    const customerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id;

    if (userId && customerId) {
      await saveStripeCustomerId(userId, customerId);
    }
  }

  return NextResponse.json({ received: true });
}

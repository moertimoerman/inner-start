import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { trackServerEvent } from "./analytics";
import { resolvePlanFromPriceId } from "./pricing";

let stripeClient: Stripe | null = null;

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: "2026-02-25.clover",
    });
  }

  return stripeClient;
}

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey);
}

async function upsertSubscriptionRecord(input: {
  supabase: any;
  email: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
  status: string;
  plan: string;
}) {
  if (!input.email) return;

  await input.supabase.from("subscriptions").upsert(
    {
      email: input.email,
      stripe_customer_id: input.customerId || null,
      stripe_subscription_id: input.subscriptionId || null,
      status: input.status,
      plan: input.plan,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" }
  );
}

export async function handleStripeWebhook(request: NextRequest) {
  const stripe = getStripeClient();
  const supabase = getAdminClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !supabase || !webhookSecret) {
    console.error(
      "WEBHOOK_CONFIG_ERROR: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET of SUPABASE_SERVICE_ROLE_KEY ontbreekt."
    );
    return NextResponse.json(
      { error: "Webhook configuratie ontbreekt op de server." },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    console.error("Webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const priceId = session.metadata?.price_id || null;

    await upsertSubscriptionRecord({
      supabase,
      email: session.customer_email,
      customerId: session.customer?.toString() || null,
      subscriptionId: session.subscription?.toString() || null,
      status: "trialing",
      plan: resolvePlanFromPriceId(priceId),
    });

    await trackServerEvent({
      event: "checkout_success",
      distinctId:
        session.metadata?.user_id ||
        session.customer_email ||
        session.customer?.toString() ||
        "unknown",
      properties: {
        priceId,
        subscriptionId: session.subscription?.toString() || null,
      },
    });
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    const invoiceAny = invoice as any;
    const subscriptionId =
      typeof invoiceAny.subscription === "string"
        ? invoiceAny.subscription
        : invoiceAny.subscription?.id || null;
    const priceId =
      invoiceAny.lines?.data?.[0]?.price?.id ||
      invoiceAny.lines?.data?.[0]?.pricing?.price_details?.price ||
      null;

    if (subscriptionId) {
      await supabase
        .from("subscriptions")
        .update({
          status: "active",
          plan: resolvePlanFromPriceId(priceId),
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscriptionId);
    }
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.created"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const priceId = subscription.items.data[0]?.price?.id || null;

    await supabase
      .from("subscriptions")
      .update({
        status: subscription.status,
        plan: resolvePlanFromPriceId(priceId),
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id);
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;

    await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id);
  }

  return NextResponse.json({ received: true });
}

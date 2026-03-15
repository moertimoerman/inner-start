import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { resolvePlanFromPriceId } from "./pricing";

export type AccessStatus = {
  isAuthenticated: boolean;
  hasActiveAccess: boolean;
  subscriptionStatus: string | null;
  plan: string | null;
};

let stripeClient: Stripe | null = null;

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey);
}

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

export async function getAccessStatusByEmail(
  email: string | null | undefined
): Promise<AccessStatus> {
  if (!email) {
    return {
      isAuthenticated: false,
      hasActiveAccess: false,
      subscriptionStatus: null,
      plan: null,
    };
  }

  const admin = getAdminClient();
  if (!admin) {
    console.error(
      "SUBSCRIPTION_STATUS_CONFIG_ERROR: NEXT_PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ontbreekt."
    );
    return {
      isAuthenticated: true,
      hasActiveAccess: false,
      subscriptionStatus: null,
      plan: null,
    };
  }

  const { data } = await admin
    .from("subscriptions")
    .select("status, plan")
    .eq("email", email)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const status = data?.status ?? null;
  const hasActiveAccess = status === "active" || status === "trialing";

  return {
    isAuthenticated: true,
    hasActiveAccess,
    subscriptionStatus: status,
    plan: data?.plan ?? null,
  };
}

export async function tryActivateAccessFromCheckoutSession(input: {
  email: string | null | undefined;
  sessionId: string | null | undefined;
}): Promise<boolean> {
  const stripe = getStripeClient();
  if (!input.email || !input.sessionId || !stripe) return false;

  const session = await stripe.checkout.sessions.retrieve(input.sessionId);
  const sessionEmail =
    session.customer_details?.email ||
    session.customer_email ||
    session.metadata?.email ||
    null;

  if (!sessionEmail || sessionEmail.toLowerCase() !== input.email.toLowerCase()) {
    return false;
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;
  if (!subscriptionId) return false;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const status = subscription.status;
  const hasActiveAccess = status === "active" || status === "trialing";
  if (!hasActiveAccess) return false;

  const priceId = subscription.items.data[0]?.price?.id ?? session.metadata?.price_id ?? null;

  const admin = getAdminClient();
  if (!admin) return false;

  await admin.from("subscriptions").upsert(
    {
      email: input.email,
      stripe_customer_id:
        typeof subscription.customer === "string" ? subscription.customer : null,
      stripe_subscription_id: subscription.id,
      status,
      plan: resolvePlanFromPriceId(priceId),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" }
  );

  return true;
}

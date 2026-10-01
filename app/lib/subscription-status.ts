import "server-only";

import type Stripe from "stripe";
import type { InnerUser } from "./auth";
import { resolvePlanFromPriceId } from "./pricing";
import { getStripeClient } from "./stripe";
import { subscriptionGrantsAccess } from "./subscription-policy";

export type AccessStatus = {
  isAuthenticated: boolean;
  hasActiveAccess: boolean;
  subscriptionStatus: Stripe.Subscription.Status | null;
  plan: "standard" | "premium" | null;
  stripeCustomerId: string | null;
};

export async function getAccessStatusForUser(
  user: InnerUser | null
): Promise<AccessStatus> {
  if (!user) {
    return {
      isAuthenticated: false,
      hasActiveAccess: false,
      subscriptionStatus: null,
      plan: null,
      stripeCustomerId: null,
    };
  }

  if (!user.stripeCustomerId) {
    return {
      isAuthenticated: true,
      hasActiveAccess: false,
      subscriptionStatus: null,
      plan: null,
      stripeCustomerId: null,
    };
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return {
      isAuthenticated: true,
      hasActiveAccess: false,
      subscriptionStatus: null,
      plan: null,
      stripeCustomerId: user.stripeCustomerId,
    };
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: user.stripeCustomerId,
    status: "all",
    limit: 100,
  });

  const current =
    subscriptions.data
      .filter((subscription) => subscriptionGrantsAccess(subscription.status))
      .sort((a, b) => b.created - a.created)[0] ?? subscriptions.data[0];

  if (!current) {
    return {
      isAuthenticated: true,
      hasActiveAccess: false,
      subscriptionStatus: null,
      plan: null,
      stripeCustomerId: user.stripeCustomerId,
    };
  }

  const priceId = current.items.data[0]?.price?.id ?? null;

  return {
    isAuthenticated: true,
    hasActiveAccess: subscriptionGrantsAccess(current.status),
    subscriptionStatus: current.status,
    plan: resolvePlanFromPriceId(priceId),
    stripeCustomerId: user.stripeCustomerId,
  };
}

import type Stripe from "stripe";

export const ACCESS_GRANTING_STATUSES = new Set<Stripe.Subscription.Status>([
  "active",
  "trialing",
]);

export const CHECKOUT_BLOCKING_STATUSES = new Set<Stripe.Subscription.Status>([
  "active",
  "trialing",
  "past_due",
  "unpaid",
  "paused",
]);

export function subscriptionGrantsAccess(status: Stripe.Subscription.Status) {
  return ACCESS_GRANTING_STATUSES.has(status);
}

export function subscriptionBlocksCheckout(status: Stripe.Subscription.Status) {
  return CHECKOUT_BLOCKING_STATUSES.has(status);
}

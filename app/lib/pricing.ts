export const STRIPE_PRODUCT_ID = "prod_U9AdVp3p2DsXAt";

const DEFAULT_PRICES = {
  standardMonthly: "price_1TAsIPEIVa7nIrkaPOAbHTSk",
  standardYearly: "price_1TAsIQEIVa7nIrkaeZ2N3Olp",
  premiumMonthly: "price_1TAsIOEIVa7nIrkaif5wWa0E",
  premiumYearly: "price_1TAsILEIVa7nIrkaKLSgxKCj",
} as const;

// Single source of truth for both client and server.
// Price IDs are public identifiers and can safely use NEXT_PUBLIC env overrides.
export const PRICES = {
  standardMonthly:
    process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD_MONTHLY ||
    process.env.STRIPE_PRICE_STANDARD_MONTHLY ||
    DEFAULT_PRICES.standardMonthly,
  standardYearly:
    process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD_YEARLY ||
    process.env.STRIPE_PRICE_STANDARD_YEARLY ||
    DEFAULT_PRICES.standardYearly,
  premiumMonthly:
    process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY ||
    process.env.STRIPE_PRICE_PREMIUM_MONTHLY ||
    DEFAULT_PRICES.premiumMonthly,
  premiumYearly:
    process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY ||
    process.env.STRIPE_PRICE_PREMIUM_YEARLY ||
    DEFAULT_PRICES.premiumYearly,
} as const;

export type PlanKey = "standard" | "premium";
export type BillingInterval = "monthly" | "yearly";

export function getPriceId(plan: PlanKey, interval: BillingInterval) {
  if (plan === "standard") {
    return interval === "yearly" ? PRICES.standardYearly : PRICES.standardMonthly;
  }
  return interval === "yearly" ? PRICES.premiumYearly : PRICES.premiumMonthly;
}

export function resolvePlanFromPriceId(priceId: string | null | undefined): PlanKey {
  if (!priceId) return "standard";
  if (priceId === PRICES.premiumMonthly || priceId === PRICES.premiumYearly) {
    return "premium";
  }
  return "standard";
}

export const VALID_PRICE_IDS = new Set(Object.values(PRICES));

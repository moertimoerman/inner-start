export const STRIPE_PRODUCT_ID = "prod_U5WgoaUZStCU0d";

export const PRICES = {
  standardMonthly: "price_1T81EPEIKNTfmVDvzEjkTbyU",
  standardYearly: "price_1T80uMEIKNTfmVDv2G8gyfxC",
  premiumMonthly: "price_1TAqkwEIKNTfmVDvogD3VUzS",
  premiumYearly: "price_1TAqpiEIKNTfmVDvVD3zgiak",
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

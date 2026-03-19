export const STRIPE_PRODUCT_ID = "prod_U9AdVp3p2DsXAt";

export type PlanKey = "standard" | "premium";
export type BillingInterval = "monthly" | "yearly";

const SERVER_PRICE_ENV_NAMES = {
  standardMonthly: "STRIPE_PRICE_STANDARD_MONTHLY",
  standardYearly: "STRIPE_PRICE_STANDARD_YEARLY",
  premiumMonthly: "STRIPE_PRICE_PREMIUM_MONTHLY",
  premiumYearly: "STRIPE_PRICE_PREMIUM_YEARLY",
} as const;

type PriceEnvKey = keyof typeof SERVER_PRICE_ENV_NAMES;

function getPriceKey(plan: PlanKey, interval: BillingInterval) {
  if (plan === "standard") {
    return interval === "yearly" ? "standardYearly" : "standardMonthly";
  }
  return interval === "yearly" ? "premiumYearly" : "premiumMonthly";
}

export function getRequiredPriceEnvName(plan: PlanKey, interval: BillingInterval) {
  return SERVER_PRICE_ENV_NAMES[getPriceKey(plan, interval)];
}

export function getCheckoutPriceId(plan: PlanKey, interval: BillingInterval) {
  const envName = getRequiredPriceEnvName(plan, interval);
  const value = process.env[envName];
  if (!value) {
    throw new Error(`Missing required Stripe env var: ${envName}`);
  }
  return value;
}

function getConfiguredPriceMap() {
  const getIfSet = (envKey: PriceEnvKey) => {
    const envName = SERVER_PRICE_ENV_NAMES[envKey];
    const value = process.env[envName];
    return value && value.trim() ? value : null;
  };

  return {
    standardMonthly: getIfSet("standardMonthly"),
    standardYearly: getIfSet("standardYearly"),
    premiumMonthly: getIfSet("premiumMonthly"),
    premiumYearly: getIfSet("premiumYearly"),
  } as const;
}

export function resolvePlanFromPriceId(priceId: string | null | undefined): PlanKey {
  if (!priceId) return "standard";
  const prices = getConfiguredPriceMap();
  if (priceId === prices.premiumMonthly || priceId === prices.premiumYearly) {
    return "premium";
  }
  return "standard";
}

export const VALID_PRICE_IDS = new Set(
  Object.values(getConfiguredPriceMap()).filter(
    (value): value is string => Boolean(value)
  )
);

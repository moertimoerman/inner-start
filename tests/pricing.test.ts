import { afterEach, describe, expect, it } from "vitest";
import {
  getCheckoutPriceId,
  getRequiredPriceEnvName,
  isBillingInterval,
} from "../app/lib/pricing";

describe("pricing policy", () => {
  afterEach(() => {
    delete process.env.STRIPE_PRICE_STANDARD_MONTHLY;
    delete process.env.STRIPE_PRICE_STANDARD_YEARLY;
  });

  it("accepts only supported billing intervals", () => {
    expect(isBillingInterval("monthly")).toBe(true);
    expect(isBillingInterval("yearly")).toBe(true);
    expect(isBillingInterval("weekly")).toBe(false);
  });

  it("uses server-only Standard price variables", () => {
    expect(getRequiredPriceEnvName("standard", "monthly")).toBe(
      "STRIPE_PRICE_STANDARD_MONTHLY"
    );
    process.env.STRIPE_PRICE_STANDARD_MONTHLY = "price_test_monthly";
    expect(getCheckoutPriceId("standard", "monthly")).toBe("price_test_monthly");
  });

  it("fails closed when a Stripe price is missing", () => {
    expect(() => getCheckoutPriceId("standard", "yearly")).toThrow(
      "STRIPE_PRICE_STANDARD_YEARLY"
    );
  });
});

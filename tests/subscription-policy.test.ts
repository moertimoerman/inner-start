import { describe, expect, it } from "vitest";
import {
  subscriptionBlocksCheckout,
  subscriptionGrantsAccess,
} from "../app/lib/subscription-policy";

describe("subscription policy", () => {
  it.each(["active", "trialing"] as const)("grants access for %s", (status) => {
    expect(subscriptionGrantsAccess(status)).toBe(true);
  });

  it.each(["canceled", "incomplete", "incomplete_expired"] as const)(
    "does not grant access for %s",
    (status) => {
      expect(subscriptionGrantsAccess(status)).toBe(false);
    }
  );

  it("blocks duplicate checkout for subscriptions needing customer action", () => {
    expect(subscriptionBlocksCheckout("past_due")).toBe(true);
    expect(subscriptionBlocksCheckout("unpaid")).toBe(true);
    expect(subscriptionBlocksCheckout("canceled")).toBe(false);
  });
});

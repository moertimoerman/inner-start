import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { isClerkConfigured } from "./config";

export type InnerUser = {
  id: string;
  email: string;
  firstName: string | null;
  stripeCustomerId: string | null;
};

function readStripeCustomerId(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") return null;
  const value = (metadata as Record<string, unknown>).stripeCustomerId;
  return typeof value === "string" && value.trim() ? value : null;
}

export async function getInnerUser(): Promise<InnerUser | null> {
  if (!isClerkConfigured()) return null;

  const { userId } = await auth();
  if (!userId) return null;

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const primaryEmail = user.emailAddresses.find(
    (address) => address.id === user.primaryEmailAddressId
  )?.emailAddress;

  if (!primaryEmail) return null;

  return {
    id: user.id,
    email: primaryEmail,
    firstName: user.firstName,
    stripeCustomerId: readStripeCustomerId(user.privateMetadata),
  };
}

export async function saveStripeCustomerId(userId: string, customerId: string) {
  if (!isClerkConfigured()) {
    throw new Error("Clerk is not configured.");
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    privateMetadata: { stripeCustomerId: customerId },
  });
}

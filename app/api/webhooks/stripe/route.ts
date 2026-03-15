import { NextRequest } from "next/server";
import { handleStripeWebhook } from "../../../lib/stripe-webhook-handler";

// Preferred Stripe webhook endpoint for production.
export async function POST(request: NextRequest) {
  return handleStripeWebhook(request);
}

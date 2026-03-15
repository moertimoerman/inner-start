import { NextRequest } from "next/server";
import { handleStripeWebhook } from "../../lib/stripe-webhook-handler";

// Backward-compatible endpoint. Preferred production endpoint is /api/webhooks/stripe.
export async function POST(request: NextRequest) {
  return handleStripeWebhook(request);
}

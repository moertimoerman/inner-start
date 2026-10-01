import { NextRequest, NextResponse } from "next/server";
import { getInnerUser } from "../../lib/auth";
import { getAppUrl } from "../../lib/config";
import { getStripeClient } from "../../lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const user = await getInnerUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
    }
    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: "Er is nog geen abonnement om te beheren." },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json(
        { error: "Betalen is nog niet geconfigureerd." },
        { status: 503 }
      );
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${getAppUrl(request.nextUrl.origin)}/dashboard`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (error) {
    console.error("BILLING_PORTAL_ERROR", error);
    return NextResponse.json(
      { error: "Het abonnementenportaal kon niet openen." },
      { status: 500 }
    );
  }
}

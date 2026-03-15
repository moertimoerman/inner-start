import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase-server";
import { getAccessStatusByEmail } from "../../lib/subscription-status";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({
        isAuthenticated: false,
        hasActiveAccess: false,
        subscriptionStatus: null,
        plan: null,
      });
    }

    const access = await getAccessStatusByEmail(user.email);
    return NextResponse.json(access);
  } catch (error) {
    console.error("ACCESS_STATUS_ERROR", error);
    return NextResponse.json(
      { error: "Kon subscription status niet ophalen." },
      { status: 500 }
    );
  }
}

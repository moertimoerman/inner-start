import { NextResponse } from "next/server";
import { getInnerUser } from "../../lib/auth";
import { getAccessStatusForUser } from "../../lib/subscription-status";

export async function GET() {
  try {
    const user = await getInnerUser();
    return NextResponse.json(await getAccessStatusForUser(user));
  } catch (error) {
    console.error("ACCESS_STATUS_ERROR", error);
    return NextResponse.json(
      { error: "Abonnementsstatus kon niet worden opgehaald." },
      { status: 500 }
    );
  }
}

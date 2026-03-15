import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { trackServerEvent } from "../../lib/analytics";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = typeof body?.event === "string" ? body.event : null;
    if (!event) {
      return NextResponse.json({ error: "event is verplicht" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const anonId =
      cookieStore.get("exp_anon_id")?.value || `anon_${Math.random().toString(36).slice(2)}`;

    await trackServerEvent({
      event,
      distinctId: anonId,
      properties: {
        variant: body?.variant || null,
        path: body?.path || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("TRACK_API_ERROR", error);
    return NextResponse.json({ error: "tracking mislukt" }, { status: 500 });
  }
}

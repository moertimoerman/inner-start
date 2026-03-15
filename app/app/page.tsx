import Link from "next/link";
import { redirect } from "next/navigation";
import AudioPlayer from "../../components/AudioPlayer";
import { createClient } from "../../utils/supabase-server";
import {
  getAccessStatusByEmail,
  tryActivateAccessFromCheckoutSession,
} from "../lib/subscription-status";
import { getServerPreferences } from "../lib/user-preferences-server";

export default async function ProtectedAppPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; session_id?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const query = await searchParams;

  if (!user) {
    redirect("/login");
  }

  let access = await getAccessStatusByEmail(user.email);
  const prefs = await getServerPreferences();
  const checkoutSuccess = query?.checkout === "success";

  // Recover access directly after Stripe return when webhook sync is delayed.
  if (!access.hasActiveAccess && checkoutSuccess && query?.session_id) {
    const recovered = await tryActivateAccessFromCheckoutSession({
      email: user.email,
      sessionId: query.session_id,
    });
    if (recovered) {
      access = await getAccessStatusByEmail(user.email);
    }
  }

  if (!access.hasActiveAccess) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "linear-gradient(to bottom, #0d0d2b, #1a1a3e)",
          padding: "60px 20px",
        }}
      >
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            borderRadius: 16,
            border: "1px solid rgba(240,198,122,0.25)",
            background: "rgba(255,255,255,0.04)",
            padding: 28,
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontFamily: "Cormorant Garamond, serif",
              color: "#f0c67a",
              fontSize: 34,
              marginBottom: 10,
            }}
          >
            Upgrade nodig
          </h1>
          {checkoutSuccess ? (
            <p style={{ color: "#f5dca8", opacity: 0.85, marginBottom: 22 }}>
              Betaling ontvangen. We verwerken je toegang nu. Ververs deze pagina
              over een paar seconden als je toegang nog niet zichtbaar is.
            </p>
          ) : (
            <p style={{ color: "#f5dca8", opacity: 0.85, marginBottom: 22 }}>
              Je bent ingelogd, maar je hebt nog geen actief abonnement voor toegang
              tot de audio app.
            </p>
          )}
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <Link
              href="/pricing"
              style={{
                textDecoration: "none",
                padding: "12px 16px",
                borderRadius: 10,
                background: "linear-gradient(135deg, #f0c67a, #f5dca8)",
                color: "#0d0d2b",
                fontWeight: 700,
              }}
            >
              Kies abonnement
            </Link>
            <Link
              href="/dashboard"
              style={{
                textDecoration: "none",
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid rgba(240,198,122,0.35)",
                color: "#f5dca8",
              }}
            >
              Terug naar dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 500px at 50% -100px, rgba(240,198,122,0.15), transparent), linear-gradient(180deg, #0d0d2b 0%, #15153b 100%)",
        padding: "40px 20px 80px",
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <h1
          style={{
            textAlign: "center",
            fontFamily: "Cormorant Garamond, serif",
            color: "#f0c67a",
            fontSize: "clamp(30px, 5vw, 44px)",
            marginBottom: 8,
          }}
        >
          Inner Sleep
        </h1>
        <p style={{ textAlign: "center", color: "#f5dca8", marginBottom: 28 }}>
          Toegang actief: {access.subscriptionStatus}
        </p>
        <AudioPlayer
          initialVoiceProfile={prefs.voiceProfile}
          initialMixPreset={prefs.mixPreset}
        />
      </div>
    </main>
  );
}

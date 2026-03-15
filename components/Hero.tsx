"use client";

import Link from "next/link";
type HomeVariant = "A" | "B";

function Moon() {
  return (
    <div
      className="absolute animate-glow-pulse"
      style={{
        top: "5%",
        right: "8%",
        width: 160,
        height: 160,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 40% 40%, var(--moon-glow), var(--moon-gold), var(--moon-light))",
        pointerEvents: "none",
      }}
    />
  );
}

export function Hero({ variant }: { variant: HomeVariant }) {
  async function trackStartTrialClick() {
    try {
      await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "cta_start_gratis_proef_click",
          variant,
          path: "/",
        }),
        keepalive: true,
      });
    } catch {
      // Ignore tracking failures.
    }
  }

  return (
    <section
      style={{
        position: "relative",
        padding: "100px 24px 80px",
        maxWidth: 800,
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <Moon />

      <p
        className="animate-float-up"
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: 14,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--moon-gold)",
          marginBottom: 20,
          animationDelay: "0.1s",
        }}
      >
        Inner Sleep
      </p>

      <h1
        className="animate-float-up"
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "clamp(36px, 6vw, 56px)",
          fontWeight: 600,
          color: "var(--text-primary)",
          lineHeight: 1.15,
          marginBottom: 20,
          animationDelay: "0.3s",
        }}
      >
        Geef je kind
        <br />
        <span style={{ color: "var(--moon-gold)" }}>innerlijke veiligheid</span>
        <br />
        <span
          style={{
            fontSize: "clamp(20px, 3.5vw, 30px)",
            color: "var(--text-muted)",
            fontWeight: 400,
          }}
        >
          — iedere nacht opnieuw
        </span>
      </h1>

      <p
        className="animate-float-up"
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: 18,
          color: "var(--text-muted)",
          lineHeight: 1.7,
          maxWidth: 540,
          margin: "0 auto 40px",
          animationDelay: "0.5s",
        }}
      >
        Inner Sleep helpt kinderen rustiger in slaap te vallen en van binnen
        steviger te worden, met kalme gesproken suggesties, slim sound design
        en een veilige slaaproutine.
      </p>

      <div
        className="animate-float-up"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          flexWrap: "wrap",
          animationDelay: "0.7s",
        }}
      >
        <Link
          href="/pricing"
          onClick={trackStartTrialClick}
          style={{
            display: "inline-block",
            padding: "16px 36px",
            background:
              "linear-gradient(135deg, var(--moon-gold), var(--moon-light))",
            borderRadius: 30,
            fontFamily: "var(--font-dm-sans)",
            fontSize: 16,
            fontWeight: 600,
            color: "var(--night-deep)",
            textDecoration: "none",
            boxShadow: "0 4px 24px rgba(240,198,122,0.3)",
          }}
        >
          Start gratis proef
        </Link>
        <Link
          href="/app"
          style={{
            display: "inline-block",
            padding: "16px 24px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(240,198,122,0.35)",
            borderRadius: 30,
            fontFamily: "var(--font-dm-sans)",
            fontSize: 16,
            fontWeight: 600,
            color: "var(--text-primary)",
            textDecoration: "none",
          }}
        >
          Open Inner Sleep
        </Link>
      </div>

      <p
        className="animate-float-up"
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: 13,
          color: "var(--text-muted)",
          opacity: 0.6,
          marginTop: 14,
          animationDelay: "0.9s",
        }}
      >
        Een rustig luistermoment voor het slapengaan - zonder schermtijd
      </p>

      <p
        className="animate-float-up"
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: 13,
          color: "var(--text-muted)",
          opacity: 0.6,
          marginTop: 6,
          animationDelay: "0.9s",
        }}
      >
        7 dagen gratis · daarna vanaf €4,99/mnd · altijd opzegbaar
      </p>
    </section>
  );
}

"use client";

import Link from "next/link";

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

export function Hero() {
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
        Wetenschappelijk onderbouwde slaap-affirmaties die het zelfvertrouwen
        van je kind versterken — precies op het moment dat het brein het meest
        ontvankelijk is.
      </p>

      <Link
        href="/pricing"
        className="animate-float-up"
        style={{
          display: "inline-block",
          padding: "16px 36px",
          background: "linear-gradient(135deg, var(--moon-gold), var(--moon-light))",
          borderRadius: 30,
          fontFamily: "var(--font-dm-sans)",
          fontSize: 16,
          fontWeight: 600,
          color: "var(--night-deep)",
          textDecoration: "none",
          boxShadow: "0 4px 24px rgba(240,198,122,0.3)",
          animationDelay: "0.7s",
        }}
      >
        Probeer 7 dagen gratis
      </Link>

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
        7 dagen gratis · daarna vanaf €4,99/mnd · altijd opzegbaar
      </p>
    </section>
  );
}

"use client";

import Link from "next/link";

export function CTASection() {
  return (
    <section
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "0 24px 80px",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "clamp(26px, 4vw, 36px)",
          color: "var(--text-primary)",
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        Klaar om te beginnen?
      </h2>
      <p
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: 16,
          color: "var(--text-muted)",
          lineHeight: 1.7,
          marginBottom: 32,
        }}
      >
        Probeer Inner Sleep 7 dagen gratis en ontdek wat een goede nachtrust
        doet voor het zelfvertrouwen van je kind.
      </p>

      <Link
        href="/pricing"
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
        }}
      >
        Bekijk abonnementen
      </Link>

      <p
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: 13,
          color: "var(--text-muted)",
          opacity: 0.6,
          marginTop: 14,
        }}
      >
        Vanaf €4,99/mnd · 7 dagen gratis · altijd opzegbaar
      </p>
    </section>
  );
}

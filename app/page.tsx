"use client";

import { useEffect, useState } from "react";

function Star({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute rounded-full animate-twinkle"
      style={style}
    />
  );
}

function StarField() {
  const [stars, setStars] = useState<
    { id: number; left: string; top: string; size: number; delay: number; duration: number; color: string }[]
  >([]);

  useEffect(() => {
    const generated = Array.from({ length: 70 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2.5 + 0.5,
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 2,
      color: Math.random() > 0.8 ? "var(--moon-gold)" : "var(--text-primary)",
    }));
    setStars(generated);
  }, []);

  return (
    <>
      {stars.map((s) => (
        <Star
          key={s.id}
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            background: s.color,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </>
  );
}

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

function PhaseCard({
  phase,
  title,
  person,
  description,
  affirmation,
}: {
  phase: string;
  title: string;
  person: string;
  description: string;
  affirmation: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 280,
        padding: 32,
        borderRadius: 20,
        background: "linear-gradient(135deg, var(--night-base), rgba(37,37,96,0.3))",
        border: "1px solid rgba(37,37,96,0.4)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: 13,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--moon-gold)",
          marginBottom: 12,
        }}
      >
        {phase}
      </p>
      <h3
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: 22,
          color: "var(--text-primary)",
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        {person}
      </h3>
      <p
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: 14,
          color: "var(--text-muted)",
          lineHeight: 1.6,
          marginBottom: 20,
        }}
      >
        {description}
      </p>
      <div
        style={{
          padding: "14px 18px",
          background: "var(--accent-soft)",
          borderRadius: 10,
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: 17,
            color: "var(--moon-light)",
            fontStyle: "italic",
            lineHeight: 1.6,
          }}
          dangerouslySetInnerHTML={{ __html: affirmation }}
        />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <StarField />

      {/* Hero */}
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
          Inner Start
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
          <span style={{ color: "var(--moon-gold)" }}>innerlijke rust</span>
        </h1>

        <p
          className="animate-float-up"
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: 18,
            color: "var(--text-muted)",
            lineHeight: 1.7,
            maxWidth: 520,
            margin: "0 auto 40px",
            animationDelay: "0.5s",
          }}
        >
          Gepersonaliseerde affirmaties die meegroeien met je kind. Gebaseerd op
          het hypnagogische venster — het moment waarop het brein het meest
          ontvankelijk is.
        </p>

        <a
          href="#probeer"
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
        </a>
      </section>

      {/* Leeftijdscategorieën */}
      <section
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 10,
          padding: "0 24px 60px",
          flexWrap: "wrap",
        }}
      >
        {["0-2 jr", "2-4 jr", "4-7 jr", "6-10 jr"].map((age) => (
          <span
            key={age}
            style={{
              padding: "8px 18px",
              borderRadius: 20,
              border: "1px solid var(--night-mid)",
              fontFamily: "var(--font-dm-sans)",
              fontSize: 13,
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            {age}
          </span>
        ))}
      </section>

      {/* Twee-fasen model */}
      <section
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: 14,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--moon-gold)",
            marginBottom: 28,
            textAlign: "center",
          }}
        >
          Het twee-fasen model
        </p>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <PhaseCard
            phase="Fase 1 · Inslapen"
            title="Inslapen"
            person="3e persoon"
            description="Zachte stem, kind hoort dit terwijl het wegzakt. Het hypnagogische venster — maximale ontvankelijkheid."
            affirmation="&ldquo;Emma is veilig.<br/>Emma is geliefd.<br/>Emma is goed zoals ze is.&rdquo;"
          />
          <PhaseCard
            phase="Fase 2 · Lichte slaap"
            title="Lichte slaap"
            person="1e persoon"
            description="Fluistertoon, werkt op het onderbewuste. Kind is in lichte slaap, brein verwerkt actief."
            affirmation="&ldquo;Ik ben veilig.<br/>Ik ben geliefd.<br/>Ik ben goed zoals ik ben.&rdquo;"
          />
        </div>
      </section>

      {/* USPs */}
      <section
        style={{
          maxWidth: 600,
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        {[
          "Gebaseerd op het hypnagogische venster",
          "AI-gepersonaliseerd op naam van je kind",
          "Vier leeftijdscategorieën: 0-2, 2-4, 4-7, 6-10",
          "Automatische stop na ~30 minuten",
        ].map((usp) => (
          <div
            key={usp}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--moon-gold)",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: 15,
                color: "var(--text-muted)",
              }}
            >
              {usp}
            </span>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "40px 24px",
          textAlign: "center",
          borderTop: "1px solid rgba(37,37,96,0.3)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          Inner Start · Innerlijke veiligheid voor je kind
        </p>
      </footer>
    </main>
  );
}
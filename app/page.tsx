"use client";

import { useEffect, useRef } from "react";

function StarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 180;
    const stars = Array.from({ length: COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.0004 + Math.random() * 0.0008,
    }));

    let raf: number;
    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        const alpha = 0.15 + 0.85 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 220, 168, ${alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
      aria-hidden="true"
    />
  );
}

function PhaseBadge({
  phase, label, sub, delay,
}: {
  phase: string; label: string; sub: string; delay: string;
}) {
  return (
    <div style={{
      animation: `floatUp 0.9s ease forwards ${delay}`,
      opacity: 0,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(240,198,122,0.12)",
      borderRadius: "1rem",
      padding: "1.5rem",
      flex: 1,
      minWidth: "200px",
    }}>
      <span style={{
        display: "inline-block",
        fontSize: "0.7rem",
        fontFamily: "var(--font-dm-mono)",
        letterSpacing: "0.15em",
        color: "var(--moon-gold)",
        background: "rgba(240,198,122,0.10)",
        padding: "2px 8px",
        borderRadius: "4px",
        marginBottom: "0.75rem",
      }}>
        {phase}
      </span>
      <p style={{
        fontFamily: "var(--font-cormorant)",
        fontSize: "1.25rem",
        fontWeight: 300,
        marginBottom: "0.25rem",
        color: "var(--moon-light)",
      }}>
        {label}
      </p>
      <p style={{ fontSize: "0.85rem", opacity: 0.5, color: "var(--moon-light)" }}>{sub}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main style={{
      background: "var(--night-deep)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      position: "relative",
    }}>
      <StarCanvas />

      {/* Achtergrond gloed */}
      <div aria-hidden="true" style={{
        position: "fixed", top: 0, left: "50%",
        transform: "translateX(-50%)",
        width: "120vw", height: "60vh",
        background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,37,96,0.6) 0%, transparent 100%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Nav */}
      <nav style={{
        position: "relative", zIndex: 10,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "1.5rem 2rem", maxWidth: "72rem", margin: "0 auto", width: "100%",
      }}>
        <span style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "1.5rem", fontWeight: 300, letterSpacing: "0.25em",
          background: "linear-gradient(135deg, #f0c67a, #f8e8c4, #f0c67a)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          inner
        </span>
        <a href="#cta" style={{
          background: "linear-gradient(135deg, #f0c67a 0%, #c8922a 100%)",
          color: "#0d0d2b", padding: "0.5rem 1.25rem",
          borderRadius: "9999px", fontSize: "0.875rem",
          fontWeight: 500, textDecoration: "none",
          fontFamily: "var(--font-dm-sans)",
        }}>
          Probeer gratis
        </a>
      </nav>

      {/* Hero */}
      <section style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center", padding: "3rem 1.5rem 5rem",
        maxWidth: "56rem", margin: "0 auto", width: "100%",
      }}>
        {/* Maan */}
        <div style={{
          width: "clamp(160px,25vw,280px)", aspectRatio: "1",
          borderRadius: "50%",
          background: "radial-gradient(circle at 38% 38%, #fffde8 0%, #f5dca8 30%, #f0c67a 60%, #c8922a 100%)",
          boxShadow: "0 0 60px 20px rgba(240,198,122,0.3), 0 0 120px 60px rgba(240,198,122,0.12)",
          marginBottom: "3rem",
          animation: "floatUp 0.9s ease forwards 0.1s",
          opacity: 0,
        }} />

        {/* Overline */}
        <p style={{
          fontFamily: "var(--font-dm-mono)",
          fontSize: "0.7rem", letterSpacing: "0.3em",
          textTransform: "uppercase", color: "var(--moon-gold)",
          opacity: 0.7, marginBottom: "1.25rem",
          animation: "floatUp 0.9s ease forwards 0.2s",
        }}>
          Inner Start — slaapaffirmaties voor kinderen
        </p>

        {/* Headline */}
        <h1 style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "clamp(2.6rem,7vw,4.5rem)",
          fontWeight: 300, lineHeight: 1.2,
          color: "var(--moon-light)",
          marginBottom: "1.5rem",
          animation: "floatUp 0.9s ease forwards 0.3s",
          opacity: 0,
        }}>
          Jouw kind in slaap,<br />
          <span style={{
            background: "linear-gradient(135deg, #f0c67a, #f8e8c4, #f0c67a)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            diep veilig van binnen.
          </span>
        </h1>

        {/* Subtekst */}
        <p style={{
          fontFamily: "var(--font-dm-sans)",
          fontWeight: 300, fontSize: "1rem", lineHeight: 1.7,
          maxWidth: "36rem", color: "var(--moon-light)",
          marginBottom: "2.5rem",
          animation: "floatUp 0.9s ease forwards 0.4s",
          opacity: 0,
        }}>
          Terwijl jouw kind in slaap valt, fluistert Inner zachte affirmaties die
          het onderbewustzijn bereiken — wetenschappelijk onderbouwd, ontworpen
          voor de rustgevende overgang naar diepe slaap.
        </p>

        {/* Affirmatie pills */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.75rem", marginBottom: "3rem" }}>
          {[
            { t: "\u201cEmma is veilig\u201d", d: "0.5s" },
            { t: "\u201cEmma is geliefd\u201d", d: "0.65s" },
            { t: "\u201cIk ben goed zoals ik ben\u201d", d: "0.8s" },
          ].map(({ t, d }) => (
            <span key={t} style={{
              fontFamily: "var(--font-cormorant)",
              fontStyle: "italic", fontSize: "1.05rem",
              padding: "0.5rem 1rem", borderRadius: "9999px",
              background: "rgba(240,198,122,0.08)",
              border: "1px solid rgba(240,198,122,0.18)",
              color: "var(--moon-light)",
              animation: `floatUp 0.9s ease forwards ${d}`,
              opacity: 0,
            }}>
              {t}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div id="cta" style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: "0.75rem",
          animation: "floatUp 0.9s ease forwards 0.9s",
          opacity: 0,
        }}>
          <a href="#" style={{
            background: "linear-gradient(135deg, #f0c67a 0%, #c8922a 100%)",
            color: "#0d0d2b", padding: "1rem 2.5rem",
            borderRadius: "9999px", fontSize: "1rem",
            fontWeight: 500, textDecoration: "none",
            fontFamily: "var(--font-dm-sans)",
          }}>
            Start gratis proefperiode
          </a>
          <span style={{ fontSize: "0.75rem", opacity: 0.4, color: "var(--moon-light)", fontFamily: "var(--font-dm-sans)" }}>
            14 dagen gratis · daarna €6.99/mnd · geen verplichtingen
          </span>
        </div>
      </section>

      {/* Twee fases */}
      <section style={{
        position: "relative", zIndex: 10,
        padding: "0 1.5rem 6rem",
        maxWidth: "56rem", margin: "0 auto", width: "100%",
      }}>
        <div style={{ display: "flex", flexDirection: "row", gap: "1.25rem", flexWrap: "wrap" }}>
          <PhaseBadge phase="Fase 1 · inslapen" label="Zachte stem, derde persoon" sub='"Emma is veilig. Emma is geliefd."' delay="0.6s" />
          <PhaseBadge phase="Fase 2 · lichte slaap" label="Fluisterstem, eerste persoon" sub='"Ik ben veilig. Ik ben goed zoals ik ben."' delay="0.75s" />
          <PhaseBadge phase="Na 30 min" label="Automatisch gestopt" sub="Diepe slaap bereikt — geen geluid meer nodig." delay="0.9s" />
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        position: "relative", zIndex: 10,
        textAlign: "center", paddingBottom: "2.5rem",
        opacity: 0.35, fontFamily: "var(--font-dm-sans)",
        fontSize: "0.75rem", color: "var(--moon-light)",
      }}>
        © 2025 Inner · inner.help · janto@inner.help
      </footer>
    </main>
  );
}
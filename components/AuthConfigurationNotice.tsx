import Link from "next/link";

export function AuthConfigurationNotice() {
  return (
    <main
      style={{
        minHeight: "70vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "linear-gradient(to bottom, #0d0d2b, #1a1a3e)",
      }}
    >
      <section
        style={{
          maxWidth: 520,
          padding: 32,
          textAlign: "center",
          border: "1px solid rgba(240,198,122,0.25)",
          borderRadius: 16,
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <h1 style={{ color: "#f0c67a", marginBottom: 12 }}>Inloggen wordt klaargezet</h1>
        <p style={{ color: "#f5dca8", lineHeight: 1.7, marginBottom: 20 }}>
          De app is lokaal gereed. Zodra Clerk aan het Vercel-project is gekoppeld,
          kun je hier accounts aanmaken en inloggen.
        </p>
        <Link href="/" style={{ color: "#f5dca8" }}>
          Terug naar home
        </Link>
      </section>
    </main>
  );
}

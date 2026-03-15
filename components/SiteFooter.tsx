import Link from "next/link";

export function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(240,198,122,0.2)",
        padding: "26px 20px 30px",
        background: "rgba(13,13,43,0.5)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          gap: 16,
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6 }}>
          <strong style={{ color: "var(--text-primary)" }}>INNER</strong>
          <br />
          contact@inner.help · Rubensstraat 93, 1077MN, Amsterdam, the Netherlands
        </div>

        <nav style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link
            href="/privacy"
            style={{ color: "var(--text-primary)", textDecoration: "none", fontSize: 14 }}
          >
            Privacy
          </Link>
          <Link
            href="/voorwaarden"
            style={{ color: "var(--text-primary)", textDecoration: "none", fontSize: 14 }}
          >
            Voorwaarden
          </Link>
        </nav>
      </div>
    </footer>
  );
}

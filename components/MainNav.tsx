"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Abonnement" },
  { href: "/app", label: "Open Inner Sleep" },
  { href: "/setup", label: "Instellingen" },
  { href: "/dashboard", label: "Account" },
];

function AccountLinks() {
  return (
    <>
      <SignedOut>
        <Link href="/login" className="nav-auth-button">
          Inloggen
        </Link>
      </SignedOut>
      <SignedIn>
        <UserButton showName />
      </SignedIn>
    </>
  );
}

export function MainNav({ authEnabled }: { authEnabled: boolean }) {
  const pathname = usePathname();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(8px)",
        background: "rgba(13,13,43,0.78)",
        borderBottom: "1px solid rgba(240,198,122,0.18)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "var(--moon-gold)",
            fontFamily: "var(--font-cormorant)",
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          Inner Sleep
        </Link>

        <nav aria-label="Hoofdnavigatie" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {LINKS.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  textDecoration: "none",
                  padding: "8px 12px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  color: active ? "#0d0d2b" : "var(--text-primary)",
                  background: active
                    ? "linear-gradient(135deg, var(--moon-gold), var(--moon-light))"
                    : "rgba(255,255,255,0.06)",
                  border: active ? "none" : "1px solid rgba(240,198,122,0.28)",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ minWidth: 88, display: "flex", justifyContent: "flex-end" }}>
          {authEnabled ? (
            <AccountLinks />
          ) : (
            <Link href="/login" className="nav-auth-button">
              Inloggen
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

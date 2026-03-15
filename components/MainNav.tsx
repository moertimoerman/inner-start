"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "../utils/supabase-browser";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Abonnement" },
  { href: "/app", label: "Open Inner Sleep" },
  { href: "/audio-dashboard", label: "Audio Dashboard" },
  { href: "/setup", label: "Instellingen" },
  { href: "/dashboard", label: "Account" },
];

export function MainNav() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return;
    }

    const supabase = createClient();
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!mounted) return;
      setUserEmail(user?.email ?? null);
    }

    void loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

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

        <nav style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
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
                  border: active
                    ? "none"
                    : "1px solid rgba(240,198,122,0.28)",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {userEmail ? (
            <Link
              href="/dashboard"
              style={{
                textDecoration: "none",
                padding: "8px 12px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-primary)",
                background: "rgba(74, 222, 128, 0.14)",
                border: "1px solid rgba(74, 222, 128, 0.45)",
              }}
            >
              Ingelogd: {userEmail}
            </Link>
          ) : (
            <Link
              href="/login"
              style={{
                textDecoration: "none",
                padding: "8px 12px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                color: "#0d0d2b",
                background: "linear-gradient(135deg, var(--moon-gold), var(--moon-light))",
                border: "none",
              }}
            >
              Inloggen
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

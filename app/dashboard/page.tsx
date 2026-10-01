import Link from "next/link";
import { redirect } from "next/navigation";
import { getInnerUser } from "../lib/auth";
import { getAccessStatusForUser } from "../lib/subscription-status";
import { SignOutButton } from "../../components/SignOutButton";
import { BillingPortalButton } from "../../components/BillingPortalButton";

export default async function DashboardPage() {
  const user = await getInnerUser();

  if (!user) {
    redirect("/login");
  }

  const access = await getAccessStatusForUser(user);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #0d0d2b, #1a1a3e)",
        padding: "48px 20px",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: 36,
                color: "#f0c67a",
              }}
            >
              Jouw Dashboard
            </h1>
            <p style={{ color: "#f5dca8", opacity: 0.75 }}>{user.email}</p>
          </div>
          <SignOutButton />
        </div>

        <div
          style={{
            border: "1px solid rgba(240,198,122,0.25)",
            borderRadius: 16,
            padding: 24,
            background: "rgba(255,255,255,0.04)",
            marginBottom: 18,
          }}
        >
          <h2 style={{ color: "#f0c67a", marginBottom: 10 }}>
            Abonnement
          </h2>
          <p style={{ color: "#f5dca8", marginBottom: 6 }}>
            Status: <strong>{access.subscriptionStatus ?? "geen abonnement"}</strong>
          </p>
          <p style={{ color: "#f5dca8" }}>
            Plan: <strong>{access.plan === "standard" ? "Standard" : access.plan ?? "n.v.t."}</strong>
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link
            href="/app"
            style={{
              textDecoration: "none",
              padding: "12px 16px",
              borderRadius: 10,
              background: "linear-gradient(135deg, #f0c67a, #f5dca8)",
              color: "#0d0d2b",
              fontWeight: 700,
            }}
          >
            Open Inner Sleep
          </Link>
          <Link
            href="/setup"
            style={{
              textDecoration: "none",
              padding: "12px 16px",
              borderRadius: 10,
              border: "1px solid rgba(240,198,122,0.35)",
              color: "#f5dca8",
            }}
          >
            Instellingen
          </Link>
          <Link
            href="/pricing"
            style={{
              textDecoration: "none",
              padding: "12px 16px",
              borderRadius: 10,
              border: "1px solid rgba(240,198,122,0.35)",
              color: "#f5dca8",
            }}
          >
            Bekijk abonnementen
          </Link>
          {access.stripeCustomerId ? <BillingPortalButton /> : null}
        </div>
      </div>
    </main>
  );
}

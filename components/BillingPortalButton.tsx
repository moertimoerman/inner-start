"use client";

import { useState } from "react";

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function openPortal() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/billing-portal", { method: "POST" });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Het portaal kon niet openen.");
      }
      window.location.assign(payload.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Het portaal kon niet openen.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void openPortal()}
        disabled={loading}
        style={{
          padding: "12px 16px",
          borderRadius: 10,
          border: "1px solid rgba(240,198,122,0.35)",
          background: "transparent",
          color: "#f5dca8",
          cursor: loading ? "wait" : "pointer",
        }}
      >
        {loading ? "Portaal openen…" : "Abonnement beheren of opzeggen"}
      </button>
      {error ? <p style={{ color: "#fca5a5", marginTop: 8 }}>{error}</p> : null}
    </div>
  );
}

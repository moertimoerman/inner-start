"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "../../utils/supabase-browser";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/reset-wachtwoord`
        : undefined;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage(
        "Als dit e-mailadres bekend is, hebben we een resetlink gestuurd. Check je inbox."
      );
    }
    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #0d0d2b, #1a1a3e)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: "16px",
          padding: "40px",
          maxWidth: "420px",
          width: "100%",
          border: "1px solid rgba(240,198,122,0.2)",
        }}
      >
        <h1
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "30px",
            color: "#f0c67a",
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          Wachtwoord vergeten
        </h1>
        <p style={{ color: "#f5dca8", textAlign: "center", marginBottom: "28px" }}>
          Vul je e-mailadres in. Je ontvangt een link om een nieuw wachtwoord te kiezen.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="E-mailadres"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px 16px",
              marginBottom: "16px",
              borderRadius: "8px",
              border: "1px solid rgba(240,198,122,0.3)",
              background: "rgba(255,255,255,0.05)",
              color: "#f8e8c4",
              fontSize: "16px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, #f0c67a, #f5dca8)",
              color: "#0d0d2b",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Even wachten..." : "Stuur resetlink"}
          </button>
        </form>

        {message ? (
          <p style={{ marginTop: "14px", color: "#4ade80", textAlign: "center", fontSize: "14px" }}>
            {message}
          </p>
        ) : null}
        {error ? (
          <p style={{ marginTop: "14px", color: "#f87171", textAlign: "center", fontSize: "14px" }}>
            {error}
          </p>
        ) : null}

        <p style={{ marginTop: "18px", textAlign: "center" }}>
          <Link href="/login" style={{ color: "#f5dca8", fontSize: "13px" }}>
            Terug naar inloggen
          </Link>
        </p>
        <p style={{ marginTop: "8px", textAlign: "center" }}>
          <Link href="/" style={{ color: "#f5dca8", fontSize: "13px" }}>
            Terug naar Home
          </Link>
        </p>
      </div>
    </div>
  );
}

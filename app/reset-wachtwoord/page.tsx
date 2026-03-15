"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase-browser";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function initRecoverySession() {
      setError("");

      const url = new URL(window.location.href);
      const tokenHash = url.searchParams.get("token_hash");
      const type = url.searchParams.get("type");

      // Newer Supabase links use token_hash in query params.
      if (tokenHash && type === "recovery") {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });
        if (verifyError) {
          if (mounted) setError("Deze resetlink is ongeldig of verlopen.");
          return;
        }
      }

      // Older links can set auth in URL hash; wait briefly so the client can process.
      await new Promise((resolve) => {
        setTimeout(resolve, 200);
      });

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session) {
        setError("Geen geldige resetsessie gevonden. Vraag opnieuw een resetlink aan.");
        return;
      }

      setReady(true);
    }

    void initRecoverySession();
    return () => {
      mounted = false;
    };
  }, [supabase.auth]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Wachtwoord moet minimaal 6 tekens hebben.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage("Je wachtwoord is bijgewerkt. Je kunt nu inloggen.");
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
          maxWidth: "430px",
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
          Nieuw wachtwoord instellen
        </h1>

        {!ready && !error ? (
          <p style={{ color: "#f5dca8", textAlign: "center" }}>Resetlink controleren...</p>
        ) : null}

        {ready ? (
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="Nieuw wachtwoord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: "100%",
                padding: "12px 16px",
                marginBottom: "12px",
                borderRadius: "8px",
                border: "1px solid rgba(240,198,122,0.3)",
                background: "rgba(255,255,255,0.05)",
                color: "#f8e8c4",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <input
              type="password"
              placeholder="Herhaal nieuw wachtwoord"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
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
              {loading ? "Even wachten..." : "Wachtwoord opslaan"}
            </button>
          </form>
        ) : null}

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

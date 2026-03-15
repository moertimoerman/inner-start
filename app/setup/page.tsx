"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_PREFERENCES,
  PREF_COOKIE_MIX,
  PREF_COOKIE_VOICE,
  type AppMixPreset,
  type VoiceProfile,
} from "../lib/user-preferences";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export default function SetupPage() {
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile>(
    DEFAULT_PREFERENCES.voiceProfile
  );
  const [mixPreset, setMixPreset] = useState<AppMixPreset>(
    DEFAULT_PREFERENCES.mixPreset
  );
  const [saved, setSaved] = useState("");

  useEffect(() => {
    const storedVoice = localStorage.getItem(PREF_COOKIE_VOICE);
    const storedMix = localStorage.getItem(PREF_COOKIE_MIX);

    if (storedVoice === "female" || storedVoice === "male") {
      setVoiceProfile(storedVoice);
    }
    if (storedMix === "soft" || storedMix === "balanced" || storedMix === "voice") {
      setMixPreset(storedMix);
    }
  }, []);

  function saveSettings() {
    localStorage.setItem(PREF_COOKIE_VOICE, voiceProfile);
    localStorage.setItem(PREF_COOKIE_MIX, mixPreset);
    setCookie(PREF_COOKIE_VOICE, voiceProfile);
    setCookie(PREF_COOKIE_MIX, mixPreset);
    setSaved("Instellingen opgeslagen. Je voorkeuren worden gebruikt in je rustomgeving.");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #0d0d2b, #1a1a3e)",
        padding: "48px 20px 80px",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "Cormorant Garamond, serif",
            color: "#f0c67a",
            fontSize: "clamp(30px, 5vw, 42px)",
            marginBottom: 10,
          }}
        >
          Instellingen
        </h1>
        <p style={{ color: "#f5dca8", opacity: 0.85, marginBottom: 24 }}>
          Kies een stem en audiobalans die past bij je kind. Later breiden we dit
          uit met premium modules en extra personalisatie.
        </p>

        <section
          style={{
            border: "1px solid rgba(240,198,122,0.25)",
            borderRadius: 16,
            background: "rgba(255,255,255,0.04)",
            padding: 22,
            marginBottom: 16,
          }}
        >
          <h2 style={{ color: "#f0c67a", marginBottom: 12 }}>Stemkeuze</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <button
              onClick={() => setVoiceProfile("female")}
              style={{
                borderRadius: 12,
                padding: "10px 14px",
                border: "1px solid rgba(240,198,122,0.35)",
                background:
                  voiceProfile === "female"
                    ? "linear-gradient(135deg, #f0c67a, #f5dca8)"
                    : "rgba(255,255,255,0.06)",
                color: voiceProfile === "female" ? "#0d0d2b" : "#f5dca8",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Vrouwenstem
            </button>
            <button
              onClick={() => setVoiceProfile("male")}
              style={{
                borderRadius: 12,
                padding: "10px 14px",
                border: "1px solid rgba(240,198,122,0.35)",
                background:
                  voiceProfile === "male"
                    ? "linear-gradient(135deg, #f0c67a, #f5dca8)"
                    : "rgba(255,255,255,0.06)",
                color: voiceProfile === "male" ? "#0d0d2b" : "#f5dca8",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Mannenstem
            </button>
          </div>
          <p style={{ marginTop: 10, color: "#f5dca8", opacity: 0.7, fontSize: 13 }}>
            Standaard gebruikt Inner Sleep de vrouwenstem als er nog geen keuze is opgeslagen.
          </p>
        </section>

        <section
          style={{
            border: "1px solid rgba(240,198,122,0.25)",
            borderRadius: 16,
            background: "rgba(255,255,255,0.04)",
            padding: 22,
            marginBottom: 20,
          }}
        >
          <h2 style={{ color: "#f0c67a", marginBottom: 12 }}>Audiobalans</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { key: "soft", label: "Soft" },
              { key: "balanced", label: "Balanced" },
              { key: "voice", label: "Voice Priority" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setMixPreset(item.key as AppMixPreset)}
                style={{
                  borderRadius: 12,
                  padding: "10px 14px",
                  border: "1px solid rgba(240,198,122,0.35)",
                  background:
                    mixPreset === item.key
                      ? "linear-gradient(135deg, #f0c67a, #f5dca8)"
                      : "rgba(255,255,255,0.06)",
                  color: mixPreset === item.key ? "#0d0d2b" : "#f5dca8",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <button
          onClick={saveSettings}
          style={{
            borderRadius: 12,
            border: "none",
            padding: "12px 18px",
            background: "linear-gradient(135deg, #f0c67a, #f5dca8)",
            color: "#0d0d2b",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Opslaan
        </button>

        {saved ? (
          <p style={{ color: "#86efac", marginTop: 12, fontSize: 14 }}>{saved}</p>
        ) : null}
      </div>
    </main>
  );
}

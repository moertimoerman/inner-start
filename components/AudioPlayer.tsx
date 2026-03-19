"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_BREATHING_LAYER_SRC } from "@/app/lib/audio-layers";
import { getStandardVoiceConfig } from "@/app/lib/standard-audio";
import {
  DEFAULT_PREFERENCES,
  PREF_COOKIE_MIX,
  PREF_COOKIE_VOICE,
  type AppMixPreset,
  type VoiceProfile,
} from "@/app/lib/user-preferences";

type MixPreset = AppMixPreset;

const MIX_PRESETS: Record<
  MixPreset,
  { label: string; music: number; breathing: number; voice: number }
> = {
  soft: { label: "Soft", music: 0.05, breathing: 0.15, voice: 1.0 },
  balanced: { label: "Balanced", music: 0.05, breathing: 0.15, voice: 1.0 },
  voice: { label: "Voice Priority", music: 0.05, breathing: 0.15, voice: 1.0 },
};

type Props = {
  initialVoiceProfile?: VoiceProfile;
  initialMixPreset?: MixPreset;
};

export default function AudioPlayer({
  initialVoiceProfile = DEFAULT_PREFERENCES.voiceProfile,
  initialMixPreset = DEFAULT_PREFERENCES.mixPreset,
}: Props) {
  const SESSION_TARGET_MS = 60 * 60 * 1000;
  const voiceRef = useRef<HTMLAudioElement>(null);
  const ambienceRef = useRef<HTMLAudioElement>(null);
  const breathingRef = useRef<HTMLAudioElement>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingMsRef = useRef<number>(SESSION_TARGET_MS);
  const playStartTsRef = useRef<number | null>(null);

  const [sessionState, setSessionState] = useState<"idle" | "playing" | "paused">(
    "idle"
  );
  const [progress, setProgress] = useState(0);
  const [musicOn, setMusicOn] = useState(true);
  const [breathingOn, setBreathingOn] = useState(true);
  const [mixPreset, setMixPreset] = useState<MixPreset>(initialMixPreset);
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile>(initialVoiceProfile);
  const [audioError, setAudioError] = useState("");

  const isPlaying = sessionState === "playing";
  const isPaused = sessionState === "paused";

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

  const activeVoice = useMemo(() => getStandardVoiceConfig(voiceProfile), [voiceProfile]);

  function applyMixVolumes() {
    const preset = MIX_PRESETS[mixPreset];

    if (voiceRef.current) voiceRef.current.volume = preset.voice;
    if (ambienceRef.current) ambienceRef.current.volume = musicOn ? preset.music : 0;
    if (breathingRef.current) breathingRef.current.volume = breathingOn ? preset.breathing : 0;
  }

  useEffect(() => {
    applyMixVolumes();
  }, [mixPreset, musicOn, breathingOn]);

  function startLayers() {
    applyMixVolumes();

    if (ambienceRef.current) {
      ambienceRef.current.loop = true;
      void ambienceRef.current.play().catch(() => {});
    }

    if (breathingRef.current) {
      breathingRef.current.loop = true;
      void breathingRef.current.play().catch(() => {});
    }
  }

  function stopLayers(resetTime: boolean) {
    if (ambienceRef.current) {
      ambienceRef.current.pause();
      if (resetTime) ambienceRef.current.currentTime = 0;
    }

    if (breathingRef.current) {
      breathingRef.current.pause();
      if (resetTime) breathingRef.current.currentTime = 0;
    }
  }

  function clearSessionTimer() {
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
  }

  function runStopTimer(remainingMs: number) {
    clearSessionTimer();
    if (remainingMs <= 0) {
      stopSession();
      return;
    }
    playStartTsRef.current = Date.now();
    sessionTimerRef.current = setTimeout(() => {
      stopSession();
    }, remainingMs);
  }

  async function startSession() {
    const voice = voiceRef.current;
    if (!voice) return;

    setAudioError("");
    voice.currentTime = 0;
    voice.loop = true;
    setProgress(0);
    remainingMsRef.current = SESSION_TARGET_MS;

    startLayers();

    await voice.play().catch(() => {
      setAudioError("Audio kon niet starten. Tik nogmaals op Start.");
    });
    setSessionState("playing");
    runStopTimer(remainingMsRef.current);
  }

  function pauseSession() {
    voiceRef.current?.pause();
    stopLayers(false);
    clearSessionTimer();
    if (playStartTsRef.current) {
      const elapsed = Date.now() - playStartTsRef.current;
      remainingMsRef.current = Math.max(0, remainingMsRef.current - elapsed);
    }
    playStartTsRef.current = null;
    setSessionState("paused");
  }

  async function resumeSession() {
    startLayers();

    const voice = voiceRef.current;
    if (!voice) return;

    await voice.play().catch(() => {
      setAudioError("Kon niet hervatten. Probeer opnieuw.");
    });
    setSessionState("playing");
    runStopTimer(remainingMsRef.current);
  }

  function stopSession() {
    clearSessionTimer();
    playStartTsRef.current = null;
    remainingMsRef.current = SESSION_TARGET_MS;

    if (voiceRef.current) {
      voiceRef.current.pause();
      voiceRef.current.currentTime = 0;
    }

    stopLayers(true);
    setProgress(0);
    setSessionState("idle");
  }

  function updateProgress() {
    const voice = voiceRef.current;
    if (!voice || !voice.duration) {
      setProgress(0);
      return;
    }

    setProgress(Math.max(0, Math.min(1, voice.currentTime / voice.duration)));
  }

  function handleVoiceEnded() {
    // Voice loops by design; 60-minute timer ends the session safely.
  }

  function handleVoiceError() {
    console.error(`STANDARD_AUDIO_FILE_MISSING_OR_INVALID: ${activeVoice.standardSrc}`);
    setAudioError(
      `Kon standaardaudio niet laden (${activeVoice.standardSrc}). Controleer of dit bestand bestaat in /public/audio/standard/.`
    );
    setSessionState("idle");
    clearSessionTimer();
    playStartTsRef.current = null;
    remainingMsRef.current = SESSION_TARGET_MS;
  }

  useEffect(() => {
    return () => {
      clearSessionTimer();
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 760,
        margin: "0 auto",
        borderRadius: 24,
        border: "1px solid rgba(240,198,122,0.25)",
        background:
          "linear-gradient(145deg, rgba(13,13,43,0.95), rgba(30,30,70,0.92))",
        boxShadow: "0 24px 80px rgba(5,5,20,0.45)",
        padding: 24,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <p
            style={{
              fontFamily: "var(--font-cormorant)",
              letterSpacing: "0.18em",
              fontSize: 12,
              textTransform: "uppercase",
              color: "var(--moon-gold)",
            }}
          >
            Inner Sleep
          </p>
          <h2
            style={{
              marginTop: 8,
              fontFamily: "var(--font-cormorant)",
              fontSize: 30,
              color: "var(--text-primary)",
            }}
          >
            Jouw rustomgeving
          </h2>
          <p style={{ marginTop: 6, color: "var(--text-muted)", fontSize: 13 }}>
            Actieve stem: {activeVoice.label}
          </p>
        </div>

        <div
          style={{
            alignSelf: "flex-start",
            padding: "8px 12px",
            borderRadius: 999,
            border: "1px solid rgba(240,198,122,0.35)",
            fontSize: 12,
            color: "var(--moon-light)",
            background: "rgba(240,198,122,0.12)",
          }}
        >
          {sessionState}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <div
          style={{
            height: 8,
            borderRadius: 99,
            background: "rgba(255,255,255,0.1)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg, var(--moon-gold), var(--moon-light))",
              transition: "width 0.25s ease",
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 10 }}>
        <button
          onClick={startSession}
          style={{
            padding: "10px 16px",
            borderRadius: 14,
            border: "none",
            background: "linear-gradient(135deg, var(--moon-gold), var(--moon-light))",
            color: "var(--night-deep)",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Start je slaaproutine
        </button>
        <button
          onClick={pauseSession}
          disabled={!isPlaying}
          style={{
            padding: "10px 16px",
            borderRadius: 14,
            border: "1px solid rgba(240,198,122,0.35)",
            background: "rgba(255,255,255,0.05)",
            color: "var(--text-primary)",
            opacity: !isPlaying ? 0.5 : 1,
            cursor: !isPlaying ? "not-allowed" : "pointer",
          }}
        >
          Pauze
        </button>
        <button
          onClick={resumeSession}
          disabled={!isPaused}
          style={{
            padding: "10px 16px",
            borderRadius: 14,
            border: "1px solid rgba(240,198,122,0.35)",
            background: "rgba(255,255,255,0.05)",
            color: "var(--text-primary)",
            opacity: !isPaused ? 0.5 : 1,
            cursor: !isPaused ? "not-allowed" : "pointer",
          }}
        >
          Hervat
        </button>
        <button
          onClick={stopSession}
          style={{
            padding: "10px 16px",
            borderRadius: 14,
            border: "1px solid rgba(240,198,122,0.35)",
            background: "rgba(255,255,255,0.05)",
            color: "var(--text-primary)",
            cursor: "pointer",
          }}
        >
          Stop
        </button>
      </div>

      <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 10 }}>
        {(Object.keys(MIX_PRESETS) as MixPreset[]).map((key) => (
          <button
            key={key}
            onClick={() => setMixPreset(key)}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid rgba(240,198,122,0.35)",
              background: mixPreset === key ? "rgba(240,198,122,0.2)" : "rgba(0,0,0,0.15)",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {MIX_PRESETS[key].label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 18 }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={musicOn} onChange={() => setMusicOn((v) => !v)} />
          <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Achtergrondmuziek</span>
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={breathingOn}
            onChange={() => setBreathingOn((v) => !v)}
          />
          <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Ademlaag</span>
        </label>
      </div>

      {audioError ? (
        <p style={{ marginTop: 12, color: "#fca5a5", fontSize: 13 }}>{audioError}</p>
      ) : null}

      <audio
        ref={voiceRef}
        src={activeVoice.standardSrc}
        onTimeUpdate={updateProgress}
        onEnded={handleVoiceEnded}
        onError={handleVoiceError}
      />
      <audio ref={ambienceRef} src="/audio/ambience.m4a" />
      <audio ref={breathingRef} src={DEFAULT_BREATHING_LAYER_SRC} />
    </div>
  );
}

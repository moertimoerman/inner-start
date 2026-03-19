"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_BREATHING_LAYER_SRC } from "../lib/audio-layers";

type PersonType = "1" | "3";
type TopicType = "Safe" | "Relax" | "Love" | "Self" | "Sleep";
type VoiceSet = "female" | "male";

type ManifestItem = {
  index: number;
  sentence: string;
  file: string;
};

const TOPICS: TopicType[] = ["Safe", "Relax", "Love", "Self", "Sleep"];

function normalizePublicPath(filePath: string) {
  return filePath.startsWith("public/") ? `/${filePath.replace(/^public\//, "")}` : filePath;
}

function clipKey(voiceSet: VoiceSet, person: PersonType, topic: TopicType, index: number) {
  const lead = voiceSet === "female" ? "Female" : "Male";
  return `${lead}NL${person}${topic}${index}.m4a`;
}

export default function AudioDashboardPage() {
  if (process.env.NODE_ENV === "production") {
    return (
      <main style={{ minHeight: "100vh", padding: "40px 20px", color: "#f5dca8" }}>
        Deze testpagina is alleen beschikbaar in lokale development.
      </main>
    );
  }

  const [voiceSet, setVoiceSet] = useState<VoiceSet>("female");
  const [person, setPerson] = useState<PersonType>("1");
  const [topic, setTopic] = useState<TopicType>("Safe");
  const [manifest, setManifest] = useState<ManifestItem[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const [voiceVolume, setVoiceVolume] = useState(100);
  const [musicVolume, setMusicVolume] = useState(40);
  const [breathingVolume, setBreathingVolume] = useState(100);
  const [voiceTempoPercent, setVoiceTempoPercent] = useState(100);

  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const breathingAudioRef = useRef<HTMLAudioElement | null>(null);
  const runIdRef = useRef(0);

  const synthCtxRef = useRef<AudioContext | null>(null);
  const synthMasterGainRef = useRef<GainNode | null>(null);
  const synthOscillatorsRef = useRef<OscillatorNode[]>([]);

  useEffect(() => {
    async function loadManifest() {
      setError("");
      setStatus("Manifest laden...");

      const url =
        voiceSet === "female"
          ? "/audio/standard/sentences/nl/female/manifest.json"
          : "/audio/standard/sentences/nl/male/manifest.json";

      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Manifest niet gevonden op ${url}`);
        }
        const data = (await res.json()) as ManifestItem[];
        setManifest(data);
        setStatus("");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Onbekende fout";
        setError(msg);
        setStatus("");
      }
    }

    void loadManifest();
  }, [voiceSet]);

  const filtered = useMemo(() => {
    const startByTopic: Record<TopicType, number> = {
      Safe: person === "1" ? 1 : 51,
      Relax: person === "1" ? 11 : 61,
      Love: person === "1" ? 21 : 71,
      Self: person === "1" ? 31 : 81,
      Sleep: person === "1" ? 41 : 91,
    };
    const start = startByTopic[topic];
    const wanted = new Set(Array.from({ length: 10 }, (_, i) => start + i));

    const byIndex = new Map<number, ManifestItem>();
    manifest.forEach((item) => {
      if (!wanted.has(item.index)) return;
      byIndex.set(item.index, item);
    });

    return Array.from(wanted)
      .sort((a, b) => a - b)
      .map((index) => {
        const item = byIndex.get(index);
        const expectedName = clipKey(voiceSet, person, topic, index);
        const src = item?.file ? normalizePublicPath(item.file) : "";
        return {
          index,
          sentence: item?.sentence ?? "",
          src,
          expectedName,
          exists: Boolean(item?.file),
        };
      });
  }, [manifest, voiceSet, person, topic]);

  useEffect(() => {
    const next = filtered.filter((x) => x.exists).map((x) => x.index);
    setSelectedIndexes(next);
  }, [voiceSet, person, topic, filtered]);

  useEffect(() => {
    const voice = voiceAudioRef.current;
    const music = musicAudioRef.current;
    const breathing = breathingAudioRef.current;
    if (voice) voice.volume = voiceVolume / 100;
    if (music) music.volume = musicVolume / 100;
    if (breathing) breathing.volume = breathingVolume / 100;

    if (synthMasterGainRef.current) {
      synthMasterGainRef.current.gain.value = (musicVolume / 100) * 0.012;
    }
  }, [voiceVolume, musicVolume, breathingVolume]);

  useEffect(() => {
    const voice = voiceAudioRef.current;
    if (!voice) return;
    voice.playbackRate = voiceTempoPercent / 100;
    voice.preservesPitch = true;
  }, [voiceTempoPercent]);

  useEffect(() => {
    return () => {
      stopAll();
      stop432Layer();
    };
  }, []);

  function start432Layer() {
    if (synthCtxRef.current && synthMasterGainRef.current) {
      synthMasterGainRef.current.gain.value = (musicVolume / 100) * 0.012;
      return;
    }

    const AudioContextCtor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;

    const ctx = new AudioContextCtor();
    const master = ctx.createGain();
    master.gain.value = (musicVolume / 100) * 0.012;
    master.connect(ctx.destination);

    const tones = [432, 648, 864];
    const oscillators: OscillatorNode[] = [];
    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 1 ? "triangle" : "sine";
      osc.frequency.value = freq;
      gain.gain.value = idx === 0 ? 1 : idx === 1 ? 0.35 : 0.1;
      osc.connect(gain);
      gain.connect(master);
      osc.start();
      oscillators.push(osc);
    });

    synthCtxRef.current = ctx;
    synthMasterGainRef.current = master;
    synthOscillatorsRef.current = oscillators;
  }

  function stop432Layer() {
    synthOscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
      } catch {}
      osc.disconnect();
    });
    synthOscillatorsRef.current = [];

    if (synthMasterGainRef.current) {
      synthMasterGainRef.current.disconnect();
      synthMasterGainRef.current = null;
    }
    if (synthCtxRef.current) {
      void synthCtxRef.current.close();
      synthCtxRef.current = null;
    }
  }

  function stopAll() {
    runIdRef.current += 1;
    setPlaying(false);
    setStatus("");

    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current.currentTime = 0;
      voiceAudioRef.current.removeAttribute("src");
      voiceAudioRef.current.load();
    }
    if (musicAudioRef.current) {
      musicAudioRef.current.pause();
      musicAudioRef.current.currentTime = 0;
    }
    if (breathingAudioRef.current) {
      breathingAudioRef.current.pause();
      breathingAudioRef.current.currentTime = 0;
    }
    stop432Layer();
  }

  async function playSequence() {
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    setError("");

    const playlist = filtered.filter((item) => selectedIndexes.includes(item.index) && item.exists);
    if (playlist.length === 0) {
      setError("Selecteer minimaal 1 bestaand audiobestand.");
      return;
    }

    const voice = voiceAudioRef.current;
    const music = musicAudioRef.current;
    const breathing = breathingAudioRef.current;
    if (!voice || !music || !breathing) return;

      try {
        setPlaying(true);
        music.loop = true;
        breathing.loop = true;
        music.volume = musicVolume / 100;
        breathing.volume = breathingVolume / 100;
        voice.volume = voiceVolume / 100;
        voice.playbackRate = voiceTempoPercent / 100;
        voice.preservesPitch = true;

      await Promise.all([music.play(), breathing.play()]);
      start432Layer();
    } catch {
      setError("Kon layers niet starten. Klik nogmaals op Play.");
      setPlaying(false);
      return;
    }

    for (const clip of playlist) {
      if (runIdRef.current !== runId) return;

      setStatus(`Speelt: ${clip.expectedName}`);
      try {
        await new Promise<void>((resolve, reject) => {
          const onEnded = () => {
            cleanup();
            resolve();
          };
          const onError = () => {
            cleanup();
            reject(new Error(`Kon clip niet laden: ${clip.expectedName}`));
          };
          const cleanup = () => {
            voice.removeEventListener("ended", onEnded);
            voice.removeEventListener("error", onError);
          };

          voice.addEventListener("ended", onEnded);
          voice.addEventListener("error", onError);
          voice.src = clip.src;
          voice.currentTime = 0;
          voice.load();
          void voice.play().catch(() => {
            cleanup();
            reject(new Error(`Kon clip niet afspelen: ${clip.expectedName}`));
          });
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Afspeelfout");
        stopAll();
        return;
      }
    }

    if (runIdRef.current === runId) {
      setStatus("Klaar.");
      setPlaying(false);
      if (musicAudioRef.current) musicAudioRef.current.pause();
      if (breathingAudioRef.current) breathingAudioRef.current.pause();
      stop432Layer();
    }
  }

  function toggleClip(index: number) {
    setSelectedIndexes((prev) =>
      prev.includes(index) ? prev.filter((x) => x !== index) : [...prev, index].sort((a, b) => a - b)
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0d0d2b 0%, #15153b 100%)",
        padding: "36px 20px 80px",
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <h1 style={{ color: "#f0c67a", fontSize: 34, marginBottom: 8 }}>Audio Dashboard</h1>
        <p style={{ color: "#f5dca8", opacity: 0.85, marginBottom: 22 }}>
          Selecteer stemclips, speel ze achter elkaar af en mix live met 432hz + breathing.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <label style={{ color: "#f5dca8" }}>
            Stemset
            <select
              value={voiceSet}
              onChange={(e) => setVoiceSet(e.target.value as VoiceSet)}
              style={{ width: "100%", marginTop: 6 }}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </label>

          <label style={{ color: "#f5dca8" }}>
            Persoon
            <select
              value={person}
              onChange={(e) => setPerson(e.target.value as PersonType)}
              style={{ width: "100%", marginTop: 6 }}
            >
              <option value="1">1e persoon</option>
              <option value="3">3e persoon</option>
            </select>
          </label>

          <label style={{ color: "#f5dca8" }}>
            Thema
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value as TopicType)}
              style={{ width: "100%", marginTop: 6 }}
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div
          style={{
            border: "1px solid rgba(240,198,122,0.2)",
            borderRadius: 14,
            padding: 14,
            marginBottom: 18,
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <h2 style={{ color: "#f0c67a", marginBottom: 10 }}>Volume (10% stappen)</h2>
          {[
            { label: "Spoor A (Stem)", value: voiceVolume, set: setVoiceVolume },
            { label: "Spoor B (Muziek + 432hz)", value: musicVolume, set: setMusicVolume },
            { label: "Spoor C (Breathing)", value: breathingVolume, set: setBreathingVolume },
          ].map((row) => (
            <label
              key={row.label}
              style={{ display: "grid", gridTemplateColumns: "220px 1fr 60px", gap: 10, color: "#f5dca8", marginBottom: 10 }}
            >
              <span>{row.label}</span>
              <input
                type="range"
                min={0}
                max={100}
                step={10}
                value={row.value}
                onChange={(e) => row.set(Number(e.target.value))}
              />
              <span>{row.value}%</span>
            </label>
          ))}

          <label
            style={{
              display: "grid",
              gridTemplateColumns: "220px 1fr 60px",
              gap: 10,
              color: "#f5dca8",
              marginBottom: 4,
            }}
          >
            <span>Stemtempo</span>
            <input
              type="range"
              min={80}
              max={120}
              step={5}
              value={voiceTempoPercent}
              onChange={(e) => setVoiceTempoPercent(Number(e.target.value))}
            />
            <span>{voiceTempoPercent}%</span>
          </label>
          <p style={{ marginTop: 4, color: "#f5dca8", opacity: 0.7, fontSize: 12 }}>
            100% = origineel, 80% t/m 120% in stappen van 5%.
          </p>
        </div>

        <div
          style={{
            border: "1px solid rgba(240,198,122,0.2)",
            borderRadius: 14,
            padding: 14,
            marginBottom: 16,
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <h2 style={{ color: "#f0c67a", marginBottom: 10 }}>Selecteer clips</h2>
          <div style={{ display: "grid", gap: 8 }}>
            {filtered.map((item) => (
              <label
                key={item.index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "24px 1fr",
                  gap: 8,
                  color: item.exists ? "#f5dca8" : "#fca5a5",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedIndexes.includes(item.index)}
                  onChange={() => toggleClip(item.index)}
                  disabled={!item.exists}
                />
                <span>
                  {item.expectedName}
                  {item.exists ? "" : " (bestand ontbreekt)"}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <button onClick={() => void playSequence()} disabled={playing} style={{ padding: "10px 14px" }}>
            {playing ? "Speelt..." : "Play Sequentie"}
          </button>
          <button onClick={stopAll} style={{ padding: "10px 14px" }}>
            Stop
          </button>
        </div>

        {status ? <p style={{ color: "#93c5fd", marginBottom: 8 }}>{status}</p> : null}
        {error ? <p style={{ color: "#fca5a5" }}>{error}</p> : null}

        <audio ref={voiceAudioRef} preload="none" />
        <audio ref={musicAudioRef} src="/audio/ambience.m4a" preload="auto" />
        <audio ref={breathingAudioRef} src={DEFAULT_BREATHING_LAYER_SRC} preload="auto" />
      </div>
    </main>
  );
}

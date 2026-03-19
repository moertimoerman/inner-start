"use client";

import { useEffect, useRef, useState } from "react";
import { type Language } from "../lib/affirmations";
import {
  AUDIO_LAYER_PLAN,
  DEFAULT_BREATHING_LAYER_SRC,
  DUTCH_TEST_SENTENCES,
  MUSIC_LAYER_SRC,
  buildDutchVoicePacingSequence,
} from "../lib/audio-layers";

type ClipStatus = "idle" | "loading" | "ready" | "error";

type SentenceClip = {
  id: number;
  text: string;
  url: string;
  status: ClipStatus;
};

type SequenceItem =
  | { src: string; label: string; type: "sentence" }
  | { src: string; label: string; type: "silence" };

type MixPreset = "soft" | "balanced" | "voice";

const TWO_MINUTES_MS = 120000;

const MIX_PRESET_VALUES: Record<
  MixPreset,
  { musicPlayerVolume: number; musicSynthGain: number; breathingVolume: number }
> = {
  soft: {
    musicPlayerVolume: 0.022,
    musicSynthGain: 0.003,
    breathingVolume: 1,
  },
  balanced: {
    musicPlayerVolume: 0.03,
    musicSynthGain: 0.004,
    breathingVolume: 1,
  },
  voice: {
    musicPlayerVolume: 0.018,
    musicSynthGain: 0.0025,
    breathingVolume: 1,
  },
};

function createInitialSentenceClips(): SentenceClip[] {
  return DUTCH_TEST_SENTENCES.map((text, index) => ({
    id: index + 1,
    text,
    url: "",
    status: "idle",
  }));
}

export default function TestVoicePage() {
  if (process.env.NODE_ENV === "production") {
    return (
      <main style={{ minHeight: "100vh", padding: "40px 20px", color: "#f5dca8" }}>
        Deze testpagina is alleen beschikbaar in lokale development.
      </main>
    );
  }

  const [text, setText] = useState(
    "You are safe. You are loved. I am safe. I am calm."
  );
  const [language, setLanguage] = useState<Language>("en");
  const [targetMinutes, setTargetMinutes] = useState(35);
  const [pauseSeconds, setPauseSeconds] = useState(5);
  const [chunkIndex, setChunkIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [debugMessage, setDebugMessage] = useState("");
  const [scriptInfo, setScriptInfo] = useState("");
  const [debugLoading, setDebugLoading] = useState(false);
  const [sentenceClips, setSentenceClips] = useState<SentenceClip[]>(
    createInitialSentenceClips()
  );
  const [sentenceLoading, setSentenceLoading] = useState(false);
  const [sentenceError, setSentenceError] = useState("");
  const [sentenceInfo, setSentenceInfo] = useState("");
  const [sentenceCacheInfo, setSentenceCacheInfo] = useState("");
  const [sequencePlaying, setSequencePlaying] = useState(false);
  const [sequenceStepLabel, setSequenceStepLabel] = useState("");
  const [musicLayerEnabled, setMusicLayerEnabled] = useState(false);
  const [breathingLayerEnabled, setBreathingLayerEnabled] = useState(false);
  const [mixPreset, setMixPreset] = useState<MixPreset>("balanced");
  const [breathingCheckPlaying, setBreathingCheckPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sequenceAudioRef = useRef<HTMLAudioElement | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const breathingAudioRef = useRef<HTMLAudioElement | null>(null);
  const sequenceRunRef = useRef(0);
  const sentenceAudioUrlsRef = useRef<string[]>([]);

  const musicContextRef = useRef<AudioContext | null>(null);
  const musicMasterGainRef = useRef<GainNode | null>(null);
  const musicLfoOscRef = useRef<OscillatorNode | null>(null);
  const musicOscillatorsRef = useRef<OscillatorNode[]>([]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      sentenceAudioUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      void syncBreathingLayer(false);
      stopMusicSynthLayer();
    };
  }, [audioUrl]);

  useEffect(() => {
    const preset = MIX_PRESET_VALUES[mixPreset];

    if (breathingAudioRef.current) {
      breathingAudioRef.current.volume = preset.breathingVolume;
    }

    if (musicAudioRef.current) {
      musicAudioRef.current.volume = preset.musicPlayerVolume;
    }

    if (musicContextRef.current && musicMasterGainRef.current) {
      const now = musicContextRef.current.currentTime;
      musicMasterGainRef.current.gain.cancelScheduledValues(now);
      musicMasterGainRef.current.gain.linearRampToValueAtTime(
        preset.musicSynthGain,
        now + 0.2
      );
    }
  }, [mixPreset]);

  function createAudioContext() {
    const Context =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Context) {
      return null;
    }
    return new Context();
  }

  function clearSentenceAudioUrls() {
    sentenceAudioUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    sentenceAudioUrlsRef.current = [];
  }

  async function syncBreathingLayer(enabled: boolean) {
    const player = breathingAudioRef.current;
    if (!player) return;
    const preset = MIX_PRESET_VALUES[mixPreset];

    // Slightly stronger than before (+~15%), still below voice.
    player.volume = preset.breathingVolume;

    if (!enabled) {
      player.pause();
      player.currentTime = 0;
      return;
    }

    player.loop = true;
    await player.play().catch(() => {
      setSentenceError(
        "Breathing layer kon niet automatisch starten. Klik nogmaals op de toggle."
      );
    });
  }

  function stopMusicSynthLayer() {
    if (musicLfoOscRef.current) {
      musicLfoOscRef.current.stop();
      musicLfoOscRef.current.disconnect();
      musicLfoOscRef.current = null;
    }

    musicOscillatorsRef.current.forEach((osc) => {
      osc.stop();
      osc.disconnect();
    });
    musicOscillatorsRef.current = [];

    if (musicMasterGainRef.current) {
      musicMasterGainRef.current.disconnect();
      musicMasterGainRef.current = null;
    }

    if (musicContextRef.current) {
      void musicContextRef.current.close();
      musicContextRef.current = null;
    }
  }

  async function startMusicSynthLayer() {
    const preset = MIX_PRESET_VALUES[mixPreset];
    if (musicContextRef.current && musicMasterGainRef.current) {
      const gainNode = musicMasterGainRef.current;
      const now = musicContextRef.current.currentTime;
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.linearRampToValueAtTime(preset.musicSynthGain, now + 0.25);
      return;
    }

    const ctx = createAudioContext();
    if (!ctx) {
      return;
    }

    // Keep 432Hz present but not dominant: blend harmonics + slow movement
    // so it feels like a soft bed instead of a harsh pure tone.
    const master = ctx.createGain();
    master.gain.value = preset.musicSynthGain;
    master.connect(ctx.destination);

    const tones = [
      { freq: 432, type: "sine" as const, gain: 0.45 },
      { freq: 648, type: "triangle" as const, gain: 0.22 },
      { freq: 864, type: "sine" as const, gain: 0.08 },
      { freq: 431.4, type: "sine" as const, gain: 0.1 },
    ];

    const oscillators: OscillatorNode[] = [];
    tones.forEach((tone) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = tone.type;
      osc.frequency.value = tone.freq;
      gain.gain.value = tone.gain * 0.01;
      osc.connect(gain);
      gain.connect(master);
      osc.start();
      oscillators.push(osc);
    });

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 0.00125;
    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);
    lfo.start();

    musicContextRef.current = ctx;
    musicMasterGainRef.current = master;
    musicOscillatorsRef.current = oscillators;
    musicLfoOscRef.current = lfo;
  }

  async function syncMusicLayer(enabled: boolean) {
    const player = musicAudioRef.current;
    if (!player) return;
    const preset = MIX_PRESET_VALUES[mixPreset];

    if (!enabled) {
      player.pause();
      player.currentTime = 0;
      stopMusicSynthLayer();
      return;
    }

    player.loop = true;
    // Keep music below voice to avoid masking speech.
    player.volume = preset.musicPlayerVolume;
    await startMusicSynthLayer();
    await player.play().catch(() => {
      setSentenceError(
        "Music layer kon niet automatisch starten. Klik nogmaals op de toggle."
      );
    });
  }

  async function handleToggleMusicLayer() {
    const next = !musicLayerEnabled;
    setMusicLayerEnabled(next);
    await syncMusicLayer(next);
  }

  async function handleToggleBreathingLayer() {
    const next = !breathingLayerEnabled;
    setBreathingLayerEnabled(next);
    await syncBreathingLayer(next);
  }

  async function ensureOptionalLayersStartedForPlayback() {
    if (musicLayerEnabled) {
      await syncMusicLayer(true);
    }
    if (breathingLayerEnabled) {
      await syncBreathingLayer(true);
    }
  }

  async function handleBreathingCheckSolo() {
    if (breathingCheckPlaying) {
      return;
    }

    setBreathingCheckPlaying(true);
    try {
      const checkPlayer = new Audio(DEFAULT_BREATHING_LAYER_SRC);
      checkPlayer.volume = 0.32;
      checkPlayer.loop = false;
      await checkPlayer.play();

      await new Promise<void>((resolve) => {
        checkPlayer.addEventListener("ended", () => resolve(), { once: true });
        checkPlayer.addEventListener("error", () => resolve(), { once: true });
      });
    } catch {
      setSentenceError(
        "Breathing check kon niet starten. Probeer opnieuw na een klik op de pagina."
      );
    } finally {
      setBreathingCheckPlaying(false);
    }
  }

  async function handleDebugAuth() {
    setDebugLoading(true);
    setError("");
    setDebugMessage("");

    try {
      const response = await fetch("/api/voice", { method: "GET" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "ElevenLabs debug check mislukt. Controleer key-permissies."
        );
      }

      const modelsCount =
        typeof data?.modelsCount === "number" ? data.modelsCount : "onbekend";
      setDebugMessage(
        `Debug OK: key geldig voor models endpoint. Aantal modellen: ${modelsCount}.`
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Onbekende debugfout.";
      setError(message);
    } finally {
      setDebugLoading(false);
    }
  }

  async function handleBuildStandardScript() {
    setError("");
    setDebugMessage("");
    setScriptInfo("");

    try {
      const url = `/api/voice?mode=script&language=${language}&targetMinutes=${targetMinutes}&pauseSeconds=${pauseSeconds}`;
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Script build mislukt.");
      }

      setText(data?.previewText || "");
      setChunkIndex(0);
      setScriptInfo(
        `Script gebouwd: doel ${data?.targetMinutes} min, geschat ${data?.estimatedMinutes} min, chunks ${data?.chunks}.`
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Onbekende scriptfout.";
      setError(message);
    }
  }

  async function handleGenerate(mode: "text" | "standard") {
    setLoading(true);
    setError("");
    setDebugMessage("");

    try {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl("");
      }

      if (mode === "text" && !text.trim()) {
        throw new Error("Voer eerst tekst in of klik op Build standard script.");
      }

      const response = await fetch("/api/voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: mode === "standard" ? "standard" : "tts",
          text: mode === "text" ? text : undefined,
          language,
          targetMinutes,
          pauseSeconds,
          chunkIndex,
        }),
      });

      if (!response.ok) {
        let message = "Voice generation mislukt.";

        try {
          const data = await response.json();
          if (data?.error) {
            message = data.error;
          }
        } catch {
          // fallback
        }

        throw new Error(message);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      const headerChunkIndex = response.headers.get("X-Inner-Chunk-Index");
      const headerChunkTotal = response.headers.get("X-Inner-Chunk-Total");
      const headerMinutes = response.headers.get("X-Inner-Estimated-Minutes");
      if (headerChunkIndex && headerChunkTotal) {
        setScriptInfo(
          `Audio chunk ${Number(headerChunkIndex) + 1}/${headerChunkTotal} gegenereerd. Geschatte totale track: ${headerMinutes || "?"} min.`
        );
      }

      setTimeout(() => {
        audioRef.current?.play().catch(() => {
          // Soms blokkeert browser autoplay; gebruiker kan dan zelf op play drukken.
        });
      }, 100);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Er ging iets mis.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateDutchSentenceSet() {
    setSentenceLoading(true);
    setSentenceError("");
    setSentenceInfo("");
    setSentenceCacheInfo("");
    setSequenceStepLabel("");
    stopSequencePlayback();

    clearSentenceAudioUrls();
    setSentenceClips(
      createInitialSentenceClips().map((clip) => ({
        ...clip,
        status: "loading",
      }))
    );

    try {
      const nextClips = createInitialSentenceClips();
      let cacheHits = 0;
      let cacheMisses = 0;

      // Sentence-level TTS is used to keep costs down:
      // generate each short line once and reuse clips for playback experiments.
      for (let i = 0; i < nextClips.length; i += 1) {
        const sentence = nextClips[i];

        const response = await fetch("/api/voice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode: "tts",
            language: "nl",
            text: sentence.text,
          }),
        });

        if (!response.ok) {
          let message = `Sentence ${sentence.id} mislukt.`;
          try {
            const data = await response.json();
            if (data?.error) {
              message = data.error;
            }
          } catch {
            // fallback
          }
          throw new Error(message);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        sentenceAudioUrlsRef.current.push(url);
        const cacheHeader = response.headers.get("X-Inner-Cache");
        if (cacheHeader === "HIT") {
          cacheHits += 1;
        } else if (cacheHeader === "MISS") {
          cacheMisses += 1;
        }

        nextClips[i] = {
          ...sentence,
          url,
          status: "ready",
        };

        setSentenceClips([...nextClips]);
      }

      setSentenceInfo(
        "8 losse NL zinnen gegenereerd. Je kunt nu losse clips beluisteren of layered playback testen."
      );
      setSentenceCacheInfo(`Cache: ${cacheHits} hits, ${cacheMisses} misses.`);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Onbekende fout bij NL sentence test set.";

      setSentenceError(message);
      setSentenceClips((prev) =>
        prev.map((clip) =>
          clip.status === "loading" ? { ...clip, status: "error" } : clip
        )
      );
    } finally {
      setSentenceLoading(false);
    }
  }

  function buildPlayableSequence(clips: SentenceClip[]): SequenceItem[] {
    // Silence is audio, not TTS text:
    // this keeps timing consistent and avoids spending credits on pause content.
    return buildDutchVoicePacingSequence().map((item) => {
      if (item.type === "silence") {
        return { src: item.src, label: item.label, type: "silence" };
      }

      const clip = clips.find((candidate) => candidate.id === item.sentenceId);
      return {
        src: clip?.url || "",
        label: `Sentence ${item.sentenceId}`,
        type: "sentence",
      };
    });
  }

  async function playOneSource(src: string, label: string, runId: number) {
    const player = sequenceAudioRef.current;
    if (!player) {
      throw new Error("Sequence audio player niet gevonden.");
    }

    if (sequenceRunRef.current !== runId) {
      return;
    }

    setSequenceStepLabel(label);

    await new Promise<void>((resolve, reject) => {
      const onEnded = () => {
        cleanup();
        resolve();
      };

      const onError = () => {
        cleanup();
        reject(new Error(`Audio kon niet worden afgespeeld: ${label}`));
      };

      const cleanup = () => {
        player.removeEventListener("ended", onEnded);
        player.removeEventListener("error", onError);
      };

      player.addEventListener("ended", onEnded);
      player.addEventListener("error", onError);
      player.src = src;
      player.currentTime = 0;
      player.play().catch((playError) => {
        cleanup();
        reject(playError);
      });
    });
  }

  function stopSequencePlayback() {
    sequenceRunRef.current += 1;
    const player = sequenceAudioRef.current;
    if (player) {
      player.pause();
      player.currentTime = 0;
    }
    setSequencePlaying(false);
    setSequenceStepLabel("");
  }

  async function handlePlayDutchSequence() {
    setSentenceError("");

    if (sentenceLoading) {
      return;
    }

    const readyClips = sentenceClips.filter((clip) => clip.status === "ready");
    if (readyClips.length !== DUTCH_TEST_SENTENCES.length) {
      setSentenceError(
        "Genereer eerst alle 8 zinnen via 'Generate Dutch Sentence Test Set'."
      );
      return;
    }

    stopSequencePlayback();
    const runId = sequenceRunRef.current;
    setSequencePlaying(true);
    await ensureOptionalLayersStartedForPlayback();

    const sequence = buildPlayableSequence(readyClips);

    try {
      for (const item of sequence) {
        if (sequenceRunRef.current !== runId) {
          return;
        }
        await playOneSource(item.src, item.label, runId);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Onbekende fout tijdens sequence playback.";
      setSentenceError(message);
    } finally {
      if (sequenceRunRef.current === runId) {
        setSequencePlaying(false);
        setSequenceStepLabel("");
      }
    }
  }

  async function handlePlayDutchTwoMinutePrototype() {
    setSentenceError("");

    if (sentenceLoading) {
      return;
    }

    const readyClips = sentenceClips.filter((clip) => clip.status === "ready");
    if (readyClips.length !== DUTCH_TEST_SENTENCES.length) {
      setSentenceError(
        "Genereer eerst alle 8 zinnen via 'Generate Dutch Sentence Test Set'."
      );
      return;
    }

    stopSequencePlayback();
    const runId = sequenceRunRef.current;
    setSequencePlaying(true);
    await ensureOptionalLayersStartedForPlayback();
    setSentenceInfo(
      "2-minuten prototype start. Dezelfde sentence-clips worden herhaald zonder nieuwe TTS-calls."
    );

    const sequence = buildPlayableSequence(readyClips);
    const startMs = Date.now();

    try {
      while (Date.now() - startMs < TWO_MINUTES_MS) {
        for (const item of sequence) {
          if (sequenceRunRef.current !== runId) {
            return;
          }
          if (Date.now() - startMs >= TWO_MINUTES_MS) {
            break;
          }
          await playOneSource(item.src, `${item.label} (2m)`, runId);
        }
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Onbekende fout tijdens 2-minuten prototype playback.";
      setSentenceError(message);
    } finally {
      if (sequenceRunRef.current === runId) {
        setSequencePlaying(false);
        setSequenceStepLabel("");
        setSentenceInfo(
          "2-minuten prototype afgerond. Goed voor goedkope pacing/kwaliteitstest."
        );
      }
    }
  }

  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold mb-6">Test Voice Generation</h1>
        <p className="text-sm text-gray-600 mb-5">
          Gebruik eerst de low-cost NL sentence test hieronder. Script/chunk tools
          staan onder Geavanceerd.
        </p>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 p-4">
            <h2 className="text-lg font-semibold">
              Layered Low-Cost Dutch Pacing Test
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Voice, breathing en music blijven losse lagen. Zo kun je goedkoop
              pacing testen en later gecontroleerd mixen.
            </p>

            <div className="mt-3 text-xs text-gray-600 space-y-1">
              <p>Voice: {AUDIO_LAYER_PLAN.voice.description}</p>
              <p>Breathing: {AUDIO_LAYER_PLAN.breathing.description}</p>
              <p>Music: {AUDIO_LAYER_PLAN.music.description}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={handleGenerateDutchSentenceSet}
                disabled={sentenceLoading || loading}
                className="rounded-xl bg-black text-white px-4 py-2 disabled:opacity-50"
              >
                {sentenceLoading
                  ? "Generating Dutch set..."
                  : "Generate Dutch Sentence Test Set"}
              </button>

              <button
                onClick={handlePlayDutchSequence}
                disabled={sentenceLoading || loading || sequencePlaying}
                className="rounded-xl border border-black px-4 py-2 disabled:opacity-50"
              >
                {sequencePlaying ? "Playing sequence..." : "Play pacing sequence"}
              </button>

              <button
                onClick={handlePlayDutchTwoMinutePrototype}
                disabled={sentenceLoading || loading || sequencePlaying}
                className="rounded-xl border border-black px-4 py-2 disabled:opacity-50"
              >
                {sequencePlaying
                  ? "Playing sequence..."
                  : "Play 2-minute prototype"}
              </button>

              <button
                onClick={stopSequencePlayback}
                disabled={!sequencePlaying}
                className="rounded-xl border border-black px-4 py-2 disabled:opacity-50"
              >
                Stop sequence
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={musicLayerEnabled}
                  onChange={handleToggleMusicLayer}
                />
                Music layer (ambient + subtle 432)
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={breathingLayerEnabled}
                  onChange={handleToggleBreathingLayer}
                />
                Breathing layer (subtle 4-in / 6-out)
              </label>
              <button
                onClick={handleBreathingCheckSolo}
                disabled={breathingCheckPlaying}
                className="rounded-lg border border-black px-3 py-1 disabled:opacity-50"
              >
                {breathingCheckPlaying
                  ? "Checking breathing..."
                  : "Check breathing (solo)"}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-700">Mix preset:</span>
              <button
                onClick={() => setMixPreset("soft")}
                className={`rounded-lg border px-3 py-1 ${
                  mixPreset === "soft" ? "bg-black text-white" : "border-black"
                }`}
              >
                Soft
              </button>
              <button
                onClick={() => setMixPreset("balanced")}
                className={`rounded-lg border px-3 py-1 ${
                  mixPreset === "balanced"
                    ? "bg-black text-white"
                    : "border-black"
                }`}
              >
                Balanced
              </button>
              <button
                onClick={() => setMixPreset("voice")}
                className={`rounded-lg border px-3 py-1 ${
                  mixPreset === "voice" ? "bg-black text-white" : "border-black"
                }`}
              >
                Voice Priority
              </button>
            </div>

            <p className="mt-2 text-xs text-gray-600">
              Snel kiezen: `Soft` = meest zacht, `Balanced` = ritme beter hoorbaar,
              `Voice Priority` = stem maximaal op de voorgrond.
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Breathing loop asset: {DEFAULT_BREATHING_LAYER_SRC}
            </p>

            {sequenceStepLabel ? (
              <p className="text-sm text-blue-700 mt-3">
                Nu afspelen: {sequenceStepLabel}
              </p>
            ) : null}

            {sentenceInfo ? (
              <p className="text-sm text-green-700 mt-3">{sentenceInfo}</p>
            ) : null}

            {sentenceCacheInfo ? (
              <p className="text-sm text-blue-700 mt-1">{sentenceCacheInfo}</p>
            ) : null}

            {sentenceError ? (
              <p className="text-sm text-red-600 mt-3">{sentenceError}</p>
            ) : null}

            <ol className="mt-4 list-decimal pl-5 space-y-2 text-sm">
              {sentenceClips.map((clip) => (
                <li key={clip.id}>
                  <p>{clip.text}</p>
                  <p className="text-xs text-gray-500">Status: {clip.status}</p>
                  {clip.url ? (
                    <audio controls src={clip.url} className="mt-1 w-full" />
                  ) : null}
                </li>
              ))}
            </ol>

            <audio ref={sequenceAudioRef} className="mt-4 w-full" controls />
            <audio ref={musicAudioRef} src={MUSIC_LAYER_SRC} preload="none" />
            <audio
              ref={breathingAudioRef}
              src={DEFAULT_BREATHING_LAYER_SRC}
              preload="none"
            />
          </div>

          <details className="rounded-2xl border border-gray-200 p-4">
            <summary className="cursor-pointer font-medium">
              Geavanceerd (script/chunk tools)
            </summary>
            <p className="text-sm text-gray-600 mt-2">
              Gebruik dit alleen als je langere script/chunk tests wil doen.
            </p>

            <div className="flex flex-wrap gap-3 mt-3">
              <button
                onClick={handleDebugAuth}
                disabled={debugLoading || loading || sentenceLoading}
                className="rounded-xl border border-black px-4 py-2 disabled:opacity-50"
              >
                {debugLoading
                  ? "Checking..."
                  : "Check ElevenLabs key permissions"}
              </button>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="rounded-xl border border-gray-300 px-3 py-2"
              >
                <option value="en">English</option>
                <option value="nl">Nederlands</option>
              </select>

              <select
                value={targetMinutes}
                onChange={(e) => setTargetMinutes(Number(e.target.value))}
                className="rounded-xl border border-gray-300 px-3 py-2"
              >
                <option value={30}>30 min</option>
                <option value={35}>35 min</option>
                <option value={40}>40 min</option>
                <option value={45}>45 min</option>
              </select>

              <select
                value={pauseSeconds}
                onChange={(e) => setPauseSeconds(Number(e.target.value))}
                className="rounded-xl border border-gray-300 px-3 py-2"
              >
                <option value={4}>4 sec pause</option>
                <option value={5}>5 sec pause</option>
                <option value={6}>6 sec pause</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-3 mt-3">
              <button
                onClick={handleBuildStandardScript}
                disabled={loading || debugLoading || sentenceLoading}
                className="rounded-xl border border-black px-4 py-2 disabled:opacity-50"
              >
                Build standard script preview
              </button>

              <select
                value={chunkIndex}
                onChange={(e) => setChunkIndex(Number(e.target.value))}
                className="rounded-xl border border-gray-300 px-3 py-2"
              >
                <option value={0}>Chunk 1</option>
                <option value={1}>Chunk 2</option>
                <option value={2}>Chunk 3</option>
                <option value={3}>Chunk 4</option>
                <option value={4}>Chunk 5</option>
              </select>
            </div>

            <div className="mt-3">
              <label
                htmlFor="voice-text"
                className="block text-sm font-medium mb-2"
              >
                Tekst voor ElevenLabs
              </label>
              <textarea
                id="voice-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:ring-2 focus:ring-black"
                placeholder="Type hier tekst of klik op Build standard script preview..."
              />
            </div>

            <div className="flex flex-wrap gap-3 mt-3">
              <button
                onClick={() => handleGenerate("text")}
                disabled={loading || sentenceLoading}
                className="rounded-xl bg-black text-white px-5 py-3 disabled:opacity-50"
              >
                {loading ? "Genereren..." : "Generate from textarea"}
              </button>

              <button
                onClick={() => handleGenerate("standard")}
                disabled={loading || sentenceLoading}
                className="rounded-xl border border-black px-5 py-3 disabled:opacity-50"
              >
                {loading ? "Genereren..." : "Generate standard chunk"}
              </button>
            </div>
          </details>

          {error ? <p className="text-red-600 text-sm">{error}</p> : null}

          {debugMessage ? (
            <p className="text-green-700 text-sm">{debugMessage}</p>
          ) : null}

          {scriptInfo ? <p className="text-blue-700 text-sm">{scriptInfo}</p> : null}

          {audioUrl ? (
            <div className="pt-4">
              <p className="mb-2 text-sm font-medium">Gegenereerde audio</p>
              <audio ref={audioRef} controls src={audioUrl} className="w-full" />
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

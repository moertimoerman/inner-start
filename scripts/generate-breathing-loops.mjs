#!/usr/bin/env node

/**
 * Generates 10 subtle breathing loops for layering under voice.
 *
 * Design:
 * - 10s loop total
 * - 4s inhale + 6s exhale
 * - airy noise (not spoken cues)
 * - inhale slightly brighter/higher than exhale
 * - seamless boundaries (first and last sample are zero)
 *
 * Output:
 * - public/audio/breathing/breathing-01.m4a ... breathing-10.m4a
 * - AAC, 64 kbps, mono, 44.1kHz via ffmpeg
 */

import fs from "fs/promises";
import path from "path";
import { execFileSync } from "child_process";

const SAMPLE_RATE = 44100;
const CHANNELS = 1;
const DURATION_SECONDS = 10;
const TOTAL_SAMPLES = SAMPLE_RATE * DURATION_SECONDS;
const OUTPUT_DIR = path.join(process.cwd(), "public", "audio", "breathing");
const TMP_DIR = path.join(process.cwd(), ".cache", "breathing-build");

function dbToGain(db) {
  return Math.pow(10, db / 20);
}

function clamp(v, min = -1, max = 1) {
  return Math.max(min, Math.min(max, v));
}

function createSeededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function createNoiseGenerator(type, random) {
  let pinkB0 = 0;
  let pinkB1 = 0;
  let pinkB2 = 0;
  let pinkB3 = 0;
  let pinkB4 = 0;
  let pinkB5 = 0;
  let pinkB6 = 0;
  let brown = 0;

  return () => {
    const white = random() * 2 - 1;

    if (type === "white") {
      return white;
    }

    if (type === "pink") {
      pinkB0 = 0.99886 * pinkB0 + white * 0.0555179;
      pinkB1 = 0.99332 * pinkB1 + white * 0.0750759;
      pinkB2 = 0.969 * pinkB2 + white * 0.153852;
      pinkB3 = 0.8665 * pinkB3 + white * 0.3104856;
      pinkB4 = 0.55 * pinkB4 + white * 0.5329522;
      pinkB5 = -0.7616 * pinkB5 - white * 0.016898;
      const out =
        pinkB0 +
        pinkB1 +
        pinkB2 +
        pinkB3 +
        pinkB4 +
        pinkB5 +
        pinkB6 +
        white * 0.5362;
      pinkB6 = white * 0.115926;
      return out * 0.1;
    }

    // brown
    brown = (brown + 0.02 * white) / 1.02;
    return brown * 3.5;
  };
}

function createLowpass(cutoffHz) {
  const dt = 1 / SAMPLE_RATE;
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const alpha = dt / (rc + dt);
  let y = 0;
  return (x) => {
    y += alpha * (x - y);
    return y;
  };
}

function createHighpass(cutoffHz) {
  const dt = 1 / SAMPLE_RATE;
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const alpha = rc / (rc + dt);
  let y = 0;
  let lastX = 0;
  return (x) => {
    y = alpha * (y + x - lastX);
    lastX = x;
    return y;
  };
}

function createBandpass(lowHz, highHz) {
  const hp = createHighpass(lowHz);
  const lp = createLowpass(highHz);
  return (x) => lp(hp(x));
}

function createSimpleReverb(delayMs, feedback, wet) {
  const delaySamples = Math.max(1, Math.floor((delayMs / 1000) * SAMPLE_RATE));
  const buffer = new Float32Array(delaySamples);
  let index = 0;

  return (input) => {
    const delayed = buffer[index];
    const next = input + delayed * feedback;
    buffer[index] = next;
    index = (index + 1) % delaySamples;
    return input * (1 - wet) + delayed * wet;
  };
}

function breathEnvelope(segmentT, segmentDuration, curve = 1.4) {
  const phase = Math.max(0, Math.min(1, segmentT / segmentDuration));
  const base = Math.sin(Math.PI * phase);
  return Math.pow(base, curve);
}

function writeMonoWav16(filePath, samples) {
  const byteRate = SAMPLE_RATE * CHANNELS * 2;
  const blockAlign = CHANNELS * 2;
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(CHANNELS, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i += 1) {
    const s = clamp(samples[i]);
    const int = s < 0 ? Math.round(s * 32768) : Math.round(s * 32767);
    buffer.writeInt16LE(int, 44 + i * 2);
  }

  return fs.writeFile(filePath, buffer);
}

function generateLoop(variation, seed) {
  const random = createSeededRandom(seed);
  const noise = createNoiseGenerator(variation.noiseType, random);

  const inhaleBand = createBandpass(
    variation.inhaleBand[0],
    variation.inhaleBand[1]
  );
  const exhaleBand = createBandpass(
    variation.exhaleBand[0],
    variation.exhaleBand[1]
  );

  const reverb = createSimpleReverb(
    variation.reverb.delayMs,
    variation.reverb.feedback,
    variation.reverb.wet
  );

  const out = new Float32Array(TOTAL_SAMPLES);
  const globalGain = dbToGain(variation.outputDb);

  for (let i = 0; i < TOTAL_SAMPLES; i += 1) {
    const t = i / SAMPLE_RATE;
    const isInhale = t < 4;
    const segT = isInhale ? t : t - 4;
    const segDur = isInhale ? 4 : 6;
    const env = breathEnvelope(segT, segDur, variation.envCurve);

    let n = noise();
    n = isInhale ? inhaleBand(n) : exhaleBand(n);

    // Slight pitch cue: inhale has subtly higher tone bed than exhale.
    const toneHz = isInhale ? variation.inhaleToneHz : variation.exhaleToneHz;
    const tone = Math.sin(2 * Math.PI * toneHz * t) * variation.toneMix;

    let sample = (n * variation.noiseMix + tone) * env;
    sample = reverb(sample);
    sample *= globalGain;

    out[i] = sample;
  }

  // Clean loop boundary
  out[0] = 0;
  out[out.length - 1] = 0;

  return out;
}

const VARIATIONS = [
  {
    noiseType: "white",
    inhaleBand: [350, 2200],
    exhaleBand: [180, 1200],
    inhaleToneHz: 238,
    exhaleToneHz: 172,
    toneMix: 0.02,
    noiseMix: 0.95,
    envCurve: 1.45,
    outputDb: -27.5,
    reverb: { delayMs: 26, feedback: 0.2, wet: 0.08 },
  },
  {
    noiseType: "pink",
    inhaleBand: [300, 2000],
    exhaleBand: [160, 1000],
    inhaleToneHz: 224,
    exhaleToneHz: 166,
    toneMix: 0.018,
    noiseMix: 0.96,
    envCurve: 1.35,
    outputDb: -28,
    reverb: { delayMs: 30, feedback: 0.22, wet: 0.1 },
  },
  {
    noiseType: "brown",
    inhaleBand: [240, 1600],
    exhaleBand: [120, 760],
    inhaleToneHz: 210,
    exhaleToneHz: 152,
    toneMix: 0.014,
    noiseMix: 0.98,
    envCurve: 1.55,
    outputDb: -29,
    reverb: { delayMs: 34, feedback: 0.24, wet: 0.09 },
  },
  {
    noiseType: "white",
    inhaleBand: [420, 2600],
    exhaleBand: [220, 1400],
    inhaleToneHz: 246,
    exhaleToneHz: 180,
    toneMix: 0.016,
    noiseMix: 0.93,
    envCurve: 1.3,
    outputDb: -27,
    reverb: { delayMs: 24, feedback: 0.18, wet: 0.07 },
  },
  {
    noiseType: "pink",
    inhaleBand: [320, 2100],
    exhaleBand: [170, 1050],
    inhaleToneHz: 232,
    exhaleToneHz: 168,
    toneMix: 0.017,
    noiseMix: 0.95,
    envCurve: 1.5,
    outputDb: -28.5,
    reverb: { delayMs: 28, feedback: 0.2, wet: 0.09 },
  },
  {
    noiseType: "brown",
    inhaleBand: [260, 1700],
    exhaleBand: [130, 800],
    inhaleToneHz: 218,
    exhaleToneHz: 156,
    toneMix: 0.013,
    noiseMix: 0.98,
    envCurve: 1.6,
    outputDb: -29.2,
    reverb: { delayMs: 36, feedback: 0.25, wet: 0.11 },
  },
  {
    noiseType: "white",
    inhaleBand: [380, 2400],
    exhaleBand: [190, 1260],
    inhaleToneHz: 240,
    exhaleToneHz: 176,
    toneMix: 0.019,
    noiseMix: 0.94,
    envCurve: 1.4,
    outputDb: -27.8,
    reverb: { delayMs: 32, feedback: 0.23, wet: 0.1 },
  },
  {
    noiseType: "pink",
    inhaleBand: [300, 1900],
    exhaleBand: [155, 960],
    inhaleToneHz: 226,
    exhaleToneHz: 164,
    toneMix: 0.015,
    noiseMix: 0.96,
    envCurve: 1.42,
    outputDb: -28.7,
    reverb: { delayMs: 27, feedback: 0.19, wet: 0.08 },
  },
  {
    noiseType: "brown",
    inhaleBand: [250, 1500],
    exhaleBand: [110, 700],
    inhaleToneHz: 206,
    exhaleToneHz: 148,
    toneMix: 0.012,
    noiseMix: 0.99,
    envCurve: 1.65,
    outputDb: -29.5,
    reverb: { delayMs: 38, feedback: 0.27, wet: 0.12 },
  },
  {
    noiseType: "white",
    inhaleBand: [340, 2300],
    exhaleBand: [180, 1180],
    inhaleToneHz: 236,
    exhaleToneHz: 170,
    toneMix: 0.018,
    noiseMix: 0.95,
    envCurve: 1.48,
    outputDb: -28.1,
    reverb: { delayMs: 29, feedback: 0.21, wet: 0.09 },
  },
];

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(TMP_DIR, { recursive: true });

  for (let i = 0; i < VARIATIONS.length; i += 1) {
    const index = i + 1;
    const id = String(index).padStart(2, "0");
    const wavPath = path.join(TMP_DIR, `breathing-${id}.wav`);
    const m4aPath = path.join(OUTPUT_DIR, `breathing-${id}.m4a`);

    const loop = generateLoop(VARIATIONS[i], 1000 + index * 17);
    await writeMonoWav16(wavPath, loop);

    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        wavPath,
        "-c:a",
        "aac",
        "-b:a",
        "64k",
        "-ac",
        "1",
        "-ar",
        String(SAMPLE_RATE),
        m4aPath,
      ],
      { stdio: "inherit" }
    );
  }

  console.log(`Generated ${VARIATIONS.length} breathing loops in ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error("Failed to generate breathing loops:", error);
  process.exitCode = 1;
});

#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, "public/audio/standard/sentences/nl/male");
const BUILD_ROOT = path.join(ROOT, "public/audio/build/male-final");
const WAV_DIR = path.join(BUILD_ROOT, "wav");
const SILENCE_DIR = path.join(BUILD_ROOT, "silence");
const LIST_DIR = path.join(BUILD_ROOT, "lists");
const OUTPUT_DIR = path.join(BUILD_ROOT, "outputs");
const REPORT_DIR = path.join(BUILD_ROOT, "reports");

const SAMPLE_RATE = 44100;
const CHANNELS = 1;
const AAC_BITRATE = "96k";

const THEMES = [
  { key: "safe", silence: 4, secondStart: 51, firstStart: 1 },
  { key: "relax", silence: 5, secondStart: 61, firstStart: 11 },
  { key: "love", silence: 5, secondStart: 71, firstStart: 21 },
  { key: "self", silence: 6, secondStart: 81, firstStart: 31 },
  { key: "sleep", silence: 7, secondStart: 91, firstStart: 41 },
];

function ensureTool(name) {
  const result = spawnSync(name, ["-version"], { stdio: "ignore" });
  if (result.status !== 0) throw new Error(`${name} ontbreekt in PATH.`);
}

function runOrThrow(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    stdio: "pipe",
    encoding: "utf8",
    ...options,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${cmd} faalde (${result.status})\n${result.stderr || result.stdout || ""}`.trim()
    );
  }
  return result.stdout.trim();
}

function runCollectStderr(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: "pipe", encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${cmd} faalde (${result.status})\n${result.stderr || ""}`.trim());
  }
  return result.stderr || "";
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function secondsFromProbe(filePath) {
  const out = runOrThrow("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=nk=1:nw=1",
    filePath,
  ]);
  const n = Number(out);
  if (!Number.isFinite(n)) throw new Error(`Kan duur niet lezen: ${filePath}`);
  return n;
}

function maxVolumeAtTime(filePath, atSeconds) {
  const start = Math.max(0, atSeconds - 0.1);
  const stderr = runCollectStderr("ffmpeg", [
    "-hide_banner",
    "-ss",
    start.toFixed(3),
    "-t",
    "0.2",
    "-i",
    filePath,
    "-af",
    "volumedetect",
    "-f",
    "null",
    "-",
  ]);
  const match = stderr.match(/max_volume:\s*(-?\d+(?:\.\d+)?)\s*dB/i);
  if (!match) return null;
  return Number(match[1]);
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildClipPlan() {
  const clips = [];
  let seq = 1;
  for (const theme of THEMES) {
    for (let i = 0; i < 10; i += 1) {
      const n = theme.secondStart + i;
      clips.push({
        sequence: seq,
        theme: theme.key,
        silenceAfter: theme.silence,
        sourceFile: `MaleNL3${capitalize(theme.key)}${n}.m4a`,
      });
      seq += 1;
    }
    for (let i = 0; i < 10; i += 1) {
      const n = theme.firstStart + i;
      clips.push({
        sequence: seq,
        theme: theme.key,
        silenceAfter: theme.silence,
        sourceFile: `MaleNL1${capitalize(theme.key)}${n}.m4a`,
      });
      seq += 1;
    }
  }
  if (clips.length !== 100) throw new Error(`Verwacht 100 clips, kreeg ${clips.length}.`);
  return clips;
}

function verifySourceExists(clips) {
  for (const clip of clips) {
    const p = path.join(SOURCE_DIR, clip.sourceFile);
    if (!fs.existsSync(p)) throw new Error(`Bronclip ontbreekt: ${p}`);
  }
}

function normalizeClipsToWav(clips) {
  const normalized = [];
  for (const clip of clips) {
    const sourcePath = path.join(SOURCE_DIR, clip.sourceFile);
    const outName = `${String(clip.sequence).padStart(3, "0")}-${clip.sourceFile.replace(
      ".m4a",
      ".wav"
    )}`;
    const outPath = path.join(WAV_DIR, outName);
    runOrThrow("ffmpeg", [
      "-y",
      "-i",
      sourcePath,
      "-ac",
      String(CHANNELS),
      "-ar",
      String(SAMPLE_RATE),
      "-c:a",
      "pcm_s16le",
      outPath,
    ]);
    normalized.push({ ...clip, wavPath: outPath, wavDuration: secondsFromProbe(outPath) });
  }
  return normalized;
}

function createSilenceWavFiles() {
  const durations = [...new Set(THEMES.map((t) => t.silence))];
  const map = {};
  for (const sec of durations) {
    const outPath = path.join(SILENCE_DIR, `silence-${sec}s.wav`);
    runOrThrow("ffmpeg", [
      "-y",
      "-f",
      "lavfi",
      "-i",
      `anullsrc=r=${SAMPLE_RATE}:cl=mono`,
      "-t",
      `${sec}.000`,
      "-ac",
      String(CHANNELS),
      "-ar",
      String(SAMPLE_RATE),
      "-c:a",
      "pcm_s16le",
      outPath,
    ]);
    map[sec] = outPath;
  }
  return map;
}

function writeConcatList(items, outPath) {
  const lines = items.map((p) => `file '${p.replace(/'/g, "'\\''")}'`);
  fs.writeFileSync(outPath, `${lines.join("\n")}\n`, "utf8");
}

function renderFromConcatList(listPath, outputWavPath) {
  runOrThrow("ffmpeg", [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listPath,
    "-c",
    "copy",
    outputWavPath,
  ]);
}

function encodeWavToM4a(inputWav, outputM4a) {
  runOrThrow("ffmpeg", [
    "-y",
    "-i",
    inputWav,
    "-c:a",
    "aac",
    "-b:a",
    AAC_BITRATE,
    "-ac",
    String(CHANNELS),
    "-ar",
    String(SAMPLE_RATE),
    outputM4a,
  ]);
}

function buildTimelineAndConcatItems(clips, silenceByDuration) {
  const concatItems = [];
  const gaps = [];
  let timeline = 0;

  clips.forEach((clip, idx) => {
    concatItems.push(clip.wavPath);
    timeline += clip.wavDuration;
    if (idx < clips.length - 1) {
      const silenceSec = clip.silenceAfter;
      const silencePath = silenceByDuration[silenceSec];
      gaps.push({
        afterSequence: clip.sequence,
        theme: clip.theme,
        expectedSeconds: silenceSec,
        startsAt: timeline,
        midpointAt: timeline + silenceSec / 2,
      });
      concatItems.push(silencePath);
      timeline += silenceSec;
    }
  });

  return { concatItems, gaps, expectedTotalSeconds: timeline };
}

function detectSilenceSegments(filePath) {
  const stderr = runCollectStderr("ffmpeg", [
    "-hide_banner",
    "-i",
    filePath,
    "-af",
    "silencedetect=noise=-50dB:d=3.8",
    "-f",
    "null",
    "-",
  ]);

  const durations = [];
  const regex = /silence_duration:\s*(\d+(?:\.\d+)?)/g;
  let match = regex.exec(stderr);
  while (match) {
    durations.push(Number(match[1]));
    match = regex.exec(stderr);
  }
  return durations;
}

function verifyOutput(label, outputFile, clips, gaps, expectedTotalSeconds) {
  const sourceSeconds = clips.reduce((sum, c) => sum + c.wavDuration, 0);
  const insertedSilenceSeconds = gaps.reduce((sum, g) => sum + g.expectedSeconds, 0);
  const actualFinalSeconds = secondsFromProbe(outputFile);
  const durationDelta = Math.abs(actualFinalSeconds - expectedTotalSeconds);

  const detectedSilences = detectSilenceSegments(outputFile);
  const longEnoughDetected = detectedSilences.filter((d) => d >= 3.8);
  const samplePoints = gaps.slice(0, Math.min(12, gaps.length));
  const midpointDbChecks = samplePoints.map((gap) => ({
    afterSequence: gap.afterSequence,
    expectedSeconds: gap.expectedSeconds,
    midpointAt: Number(gap.midpointAt.toFixed(3)),
    maxVolumeDb: maxVolumeAtTime(outputFile, gap.midpointAt),
  }));
  const silentMidpoints = midpointDbChecks.filter(
    (v) => v.maxVolumeDb !== null && v.maxVolumeDb <= -60
  ).length;

  const durationPass = durationDelta <= 0.5;
  const silencedetectPass = longEnoughDetected.length >= gaps.length * 0.95;
  const midpointPass = silentMidpoints >= Math.floor(midpointDbChecks.length * 0.9);

  return {
    label,
    sourceClipCount: clips.length,
    insertedSilenceCount: gaps.length,
    totalSourceClipDurationSeconds: Number(sourceSeconds.toFixed(3)),
    totalInsertedSilenceDurationSeconds: Number(insertedSilenceSeconds.toFixed(3)),
    expectedFinalDurationSeconds: Number(expectedTotalSeconds.toFixed(3)),
    actualFinalDurationSeconds: Number(actualFinalSeconds.toFixed(3)),
    durationDeltaSeconds: Number(durationDelta.toFixed(3)),
    detectedLongSilenceSegments: longEnoughDetected.length,
    sampledMidpoints: midpointDbChecks,
    sampledSilentMidpoints: silentMidpoints,
    checks: {
      durationPass,
      silencedetectPass,
      midpointPass,
      pass: durationPass && silencedetectPass && midpointPass,
    },
  };
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function main() {
  ensureTool("ffmpeg");
  ensureTool("ffprobe");

  ensureDir(BUILD_ROOT);
  ensureDir(WAV_DIR);
  ensureDir(SILENCE_DIR);
  ensureDir(LIST_DIR);
  ensureDir(OUTPUT_DIR);
  ensureDir(REPORT_DIR);

  const clips = buildClipPlan();
  verifySourceExists(clips);
  const normalizedClips = normalizeClipsToWav(clips);
  const silenceByDuration = createSilenceWavFiles();

  const fullTimeline = buildTimelineAndConcatItems(normalizedClips, silenceByDuration);
  const fullListPath = path.join(LIST_DIR, "male-100-concat.txt");
  writeConcatList(fullTimeline.concatItems, fullListPath);

  const debugClips = normalizedClips.slice(0, 5);
  const debugTimeline = buildTimelineAndConcatItems(debugClips, silenceByDuration);
  const debugListPath = path.join(LIST_DIR, "male-debug-5-concat.txt");
  writeConcatList(debugTimeline.concatItems, debugListPath);

  const debugWav = path.join(OUTPUT_DIR, "male-debug-first5-with-silence.wav");
  const debugM4a = path.join(OUTPUT_DIR, "male-debug-first5-with-silence.m4a");
  renderFromConcatList(debugListPath, debugWav);
  encodeWavToM4a(debugWav, debugM4a);

  const fullWav = path.join(OUTPUT_DIR, "male-full-100-with-themed-silence.wav");
  const fullM4a = path.join(OUTPUT_DIR, "male-full-100-with-themed-silence.m4a");
  renderFromConcatList(fullListPath, fullWav);
  encodeWavToM4a(fullWav, fullM4a);

  const debugReport = verifyOutput(
    "debug-first5",
    debugM4a,
    debugClips,
    debugTimeline.gaps,
    debugTimeline.expectedTotalSeconds
  );
  const fullReport = verifyOutput(
    "full-100",
    fullM4a,
    normalizedClips,
    fullTimeline.gaps,
    fullTimeline.expectedTotalSeconds
  );

  const report = {
    method:
      "All clips converted to PCM WAV first, silence generated as PCM WAV, concatenated in WAV domain, then encoded once to final AAC/M4A.",
    debugOutput: debugM4a,
    finalOutput: fullM4a,
    debugReport,
    fullReport,
  };

  saveJson(path.join(REPORT_DIR, "male-render-report.json"), report);
  console.log(JSON.stringify(report, null, 2));

  if (!debugReport.checks.pass || !fullReport.checks.pass) {
    process.exitCode = 2;
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

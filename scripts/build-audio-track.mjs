#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function parseArgs(argv) {
  const args = {
    inputDir: "",
    contains: "",
    outputName: "",
    startIndex: null,
    endIndex: null,
    sampleRate: 44100,
    channels: 1,
    bitrate: "96k",
    silenceSeconds: 4.0,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];

    if (key === "--input-dir" && value) {
      args.inputDir = value;
      i += 1;
    } else if (key === "--contains" && value) {
      args.contains = value;
      i += 1;
    } else if (key === "--output-name" && value) {
      args.outputName = value;
      i += 1;
    } else if (key === "--start-index" && value) {
      args.startIndex = Number(value);
      i += 1;
    } else if (key === "--end-index" && value) {
      args.endIndex = Number(value);
      i += 1;
    } else if (key === "--silence-seconds" && value) {
      args.silenceSeconds = Number(value);
      i += 1;
    } else if (key === "--sample-rate" && value) {
      args.sampleRate = Number(value);
      i += 1;
    } else if (key === "--channels" && value) {
      args.channels = Number(value);
      i += 1;
    } else if (key === "--bitrate" && value) {
      args.bitrate = value;
      i += 1;
    }
  }

  if (!args.inputDir) {
    throw new Error("Missing required --input-dir");
  }
  if (!args.outputName) {
    throw new Error("Missing required --output-name");
  }

  return args;
}

function runOrThrow(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    stdio: "pipe",
    encoding: "utf8",
    ...options,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${command} failed (${result.status})\n${result.stderr || ""}`.trim()
    );
  }

  return result.stdout.trim();
}

function ensureTool(name) {
  const result = spawnSync(name, ["-version"], { stdio: "ignore" });
  if (result.status !== 0) {
    throw new Error(`${name} is not available in PATH`);
  }
}

function extractNumericSuffix(fileName) {
  const match = fileName.match(/(\d+)(?=\.m4a$)/i);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

function getDurationSeconds(filePath) {
  const out = runOrThrow("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=nk=1:nw=1",
    filePath,
  ]);

  const value = Number(out);
  if (!Number.isFinite(value)) {
    throw new Error(`Could not parse duration from ${filePath}`);
  }
  return value;
}

function normalizeClip(inputPath, outputPath, config) {
  runOrThrow("ffmpeg", [
    "-y",
    "-i",
    inputPath,
    "-c:a",
    "aac",
    "-b:a",
    config.bitrate,
    "-ac",
    String(config.channels),
    "-ar",
    String(config.sampleRate),
    outputPath,
  ]);
}

function generateSilence(outputPath, config) {
  runOrThrow("ffmpeg", [
    "-y",
    "-f",
    "lavfi",
    "-i",
    `anullsrc=r=${config.sampleRate}:cl=mono`,
    "-t",
    config.silenceSeconds.toFixed(3),
    "-c:a",
    "aac",
    "-b:a",
    config.bitrate,
    "-ac",
    String(config.channels),
    "-ar",
    String(config.sampleRate),
    outputPath,
  ]);
}

function main() {
  ensureTool("ffmpeg");
  ensureTool("ffprobe");

  const args = parseArgs(process.argv);
  const inputDir = path.resolve(process.cwd(), args.inputDir);

  if (!fs.existsSync(inputDir)) {
    throw new Error(`Input directory does not exist: ${inputDir}`);
  }

  const allM4a = fs
    .readdirSync(inputDir)
    .filter((name) => name.toLowerCase().endsWith(".m4a"));

  const selected = allM4a
    .filter((name) => (args.contains ? name.includes(args.contains) : true))
    .filter((name) => {
      const idx = extractNumericSuffix(name);
      if (args.startIndex !== null && idx < args.startIndex) return false;
      if (args.endIndex !== null && idx > args.endIndex) return false;
      return true;
    })
    .sort((a, b) => extractNumericSuffix(a) - extractNumericSuffix(b));

  if (selected.length === 0) {
    throw new Error(
      `No .m4a files matched in ${inputDir}${args.contains ? ` with contains='${args.contains}'` : ""}`
    );
  }

  const buildRoot = path.resolve(process.cwd(), "public/audio/build");
  const normalizedDir = path.join(buildRoot, "normalized", args.outputName);
  const outputDir = path.join(buildRoot, "outputs");
  fs.mkdirSync(normalizedDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });

  const normalizedClips = [];

  selected.forEach((fileName, idx) => {
    const inputPath = path.join(inputDir, fileName);
    const outName = `${String(idx + 1).padStart(3, "0")}.m4a`;
    const outputPath = path.join(normalizedDir, outName);

    normalizeClip(inputPath, outputPath, args);
    normalizedClips.push(outputPath);
  });

  const silencePath = path.join(normalizedDir, "silence4s.m4a");
  generateSilence(silencePath, args);

  const concatListPath = path.join(normalizedDir, "concat-list.txt");
  const concatLines = [];

  normalizedClips.forEach((clipPath, idx) => {
    concatLines.push(`file '${clipPath.replace(/'/g, "'\\''")}'`);
    if (idx < normalizedClips.length - 1) {
      concatLines.push(`file '${silencePath.replace(/'/g, "'\\''")}'`);
    }
  });

  fs.writeFileSync(concatListPath, `${concatLines.join("\n")}\n`, "utf8");

  const finalOutputPath = path.join(outputDir, `${args.outputName}.m4a`);
  runOrThrow("ffmpeg", [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    concatListPath,
    "-c:a",
    "aac",
    "-b:a",
    args.bitrate,
    "-ac",
    String(args.channels),
    "-ar",
    String(args.sampleRate),
    finalOutputPath,
  ]);

  const clipDurations = normalizedClips.map((clip) => getDurationSeconds(clip));
  const totalClipSeconds = clipDurations.reduce((sum, d) => sum + d, 0);
  const insertedSilenceCount = normalizedClips.length - 1;
  const expectedSilenceSeconds = insertedSilenceCount * args.silenceSeconds;
  const expectedTotalSeconds = totalClipSeconds + expectedSilenceSeconds;
  const actualFinalSeconds = getDurationSeconds(finalOutputPath);
  const delta = Math.abs(actualFinalSeconds - expectedTotalSeconds);
  const durationConsistent = delta <= 0.35;

  const report = {
    output: finalOutputPath,
    normalizedDir,
    sourceClipCount: normalizedClips.length,
    insertedSilenceCount,
    expectedTotalSilenceSeconds: Number(expectedSilenceSeconds.toFixed(3)),
    expectedTotalSeconds: Number(expectedTotalSeconds.toFixed(3)),
    actualFinalSeconds: Number(actualFinalSeconds.toFixed(3)),
    durationDeltaSeconds: Number(delta.toFixed(3)),
    durationConsistent,
  };

  fs.writeFileSync(
    path.join(normalizedDir, "build-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8"
  );

  console.log(JSON.stringify(report, null, 2));

  if (!durationConsistent) {
    process.exitCode = 2;
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

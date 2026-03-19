#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { DUTCH_AFFIRMATIONS } from "./data/affirmations-nl.mjs";

function loadEnvLocalIntoProcess() {
  const envPath = path.join(process.cwd(), ".env.local");
  return fs.readFile(envPath, "utf8")
    .then((content) => {
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
        if (!match) continue;

        const key = match[1];
        let value = match[2] ?? "";

        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        if (!(key in process.env)) {
          process.env[key] = value;
        }
      }
    })
    .catch(() => {
      // If .env.local does not exist, rely on current shell env.
    });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {
    voiceProfile: "female",
    language: "nl",
    tempo: 1,
  };

  for (let i = 0; i < args.length; i += 1) {
    const current = args[i];
    const next = args[i + 1];

    if (current === "--voice" && next) {
      out.voiceProfile = next;
      i += 1;
      continue;
    }

    if (current === "--language" && next) {
      out.language = next;
      i += 1;
      continue;
    }

    if (current === "--tempo" && next) {
      out.tempo = Number(next);
      i += 1;
      continue;
    }
  }

  return out;
}

function resolveVoiceId(voiceProfile) {
  if (voiceProfile === "male") {
    return (
      process.env.ELEVENLABS_VOICE_ID_MALE ||
      process.env.ELEVENLABS_VOICE_ID_FEMALE ||
      process.env.ELEVENLABS_VOICE_ID ||
      ""
    ).trim();
  }

  return (
    process.env.ELEVENLABS_VOICE_ID_FEMALE ||
    process.env.ELEVENLABS_VOICE_ID ||
    ""
  ).trim();
}

function requireFfmpeg() {
  return new Promise((resolve, reject) => {
    const child = spawn("ffmpeg", ["-version"], { stdio: "ignore" });
    child.on("error", () => reject(new Error("ffmpeg niet gevonden. Installeer ffmpeg eerst.")));
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error("ffmpeg niet beschikbaar."));
    });
  });
}

function convertMp3ToM4a(inputPath, outputPath, tempo = 1) {
  const args = [
    "-y",
    "-i",
    inputPath,
  ];

  if (tempo !== 1) {
    args.push("-filter:a", `atempo=${tempo}`);
  }

  args.push(
    "-c:a",
    "aac",
    "-b:a",
    "96k",
    "-ac",
    "1",
    "-ar",
    "44100",
    outputPath
  );

  return new Promise((resolve, reject) => {
    const child = spawn("ffmpeg", args, { stdio: "ignore" });

    child.on("error", (error) => reject(error));
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg conversie mislukt (${code}).`));
    });
  });
}

function pad3(n) {
  return String(n).padStart(3, "0");
}

async function generateSentenceClip({
  apiKey,
  voiceId,
  sentence,
  outputM4aPath,
  tempo,
}) {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: sentence,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.65,
        similarity_boost: 0.7,
        style: 0.05,
        use_speaker_boost: true,
      },
    }),
    signal: AbortSignal.timeout(35000),
  });

  if (!response.ok) {
    let detail = "";
    try {
      detail = JSON.stringify(await response.json());
    } catch {
      detail = await response.text();
    }
    throw new Error(`ElevenLabs fout (${response.status}): ${detail}`);
  }

  const tempMp3Path = path.join(
    os.tmpdir(),
    `inner-standard-${Date.now()}-${Math.random().toString(36).slice(2)}.mp3`
  );

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(tempMp3Path, audioBuffer);
  await convertMp3ToM4a(tempMp3Path, outputM4aPath, tempo);
  await fs.unlink(tempMp3Path).catch(() => {});
}

async function main() {
  await loadEnvLocalIntoProcess();
  await requireFfmpeg();

  const { voiceProfile, language, tempo } = parseArgs();
  if (language !== "nl") {
    throw new Error("Alleen --language nl wordt in dit MVP script ondersteund.");
  }
  if (!Number.isFinite(tempo) || tempo < 0.5 || tempo > 2) {
    throw new Error("Tempo moet tussen 0.5 en 2 liggen (ffmpeg atempo range).");
  }

  const apiKey = (process.env.ELEVENLABS_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY ontbreekt in .env.local of shell env.");
  }

  const voiceId = resolveVoiceId(voiceProfile);
  if (!voiceId) {
    throw new Error(
      `Voice ID ontbreekt. Zet ELEVENLABS_VOICE_ID_${voiceProfile.toUpperCase()} of ELEVENLABS_VOICE_ID.`
    );
  }

  const outputDir = path.join(
    process.cwd(),
    "public",
    "audio",
    "standard",
    "sentences",
    language,
    voiceProfile
  );
  await fs.mkdir(outputDir, { recursive: true });

  const manifest = [];

  for (let i = 0; i < DUTCH_AFFIRMATIONS.length; i += 1) {
    const sentence = DUTCH_AFFIRMATIONS[i];
    const filename = `${pad3(i + 1)}.m4a`;
    const outputPath = path.join(outputDir, filename);
    const relativePath = path.relative(process.cwd(), outputPath);

    const exists = await fs
      .access(outputPath)
      .then(() => true)
      .catch(() => false);

    if (exists) {
      process.stdout.write(`Skip ${voiceProfile} zin ${i + 1}/${DUTCH_AFFIRMATIONS.length} (bestaat al)\\n`);
      manifest.push({
        index: i + 1,
        sentence,
        file: relativePath,
      });
      continue;
    }

    process.stdout.write(`Genereer ${voiceProfile} zin ${i + 1}/${DUTCH_AFFIRMATIONS.length}...\\n`);
    try {
      await generateSentenceClip({
        apiKey,
        voiceId,
        sentence,
        outputM4aPath: outputPath,
        tempo,
      });
    } catch (error) {
      const manifestPath = path.join(outputDir, "manifest.json");
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
      throw error;
    }

    manifest.push({
      index: i + 1,
      sentence,
      file: relativePath,
    });
  }

  const manifestPath = path.join(outputDir, "manifest.json");
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

  process.stdout.write(`Klaar. Bestanden opgeslagen in ${outputDir}\n`);
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});

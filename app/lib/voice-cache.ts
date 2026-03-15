import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

type CacheInput = {
  text: string;
  language: string;
  voiceId: string;
  modelId: string;
  voiceSettings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
};

const CACHE_DIR = path.join(process.cwd(), ".cache", "voice-clips");

function normalizeText(text: string) {
  return text.trim().replace(/\s+/g, " ");
}

export function createVoiceCacheKey(input: CacheInput) {
  const payload = JSON.stringify({
    ...input,
    text: normalizeText(input.text),
  });

  return createHash("sha256").update(payload).digest("hex");
}

function getAudioPath(cacheKey: string) {
  // Current raw provider output is MP3-compatible bytes.
  // Later M4A conversion can be added in a separate step.
  return path.join(CACHE_DIR, `${cacheKey}.mp3`);
}

export async function readVoiceClipFromCache(cacheKey: string) {
  const filePath = getAudioPath(cacheKey);

  try {
    return await readFile(filePath);
  } catch {
    return null;
  }
}

export async function writeVoiceClipToCache(cacheKey: string, data: Buffer) {
  const filePath = getAudioPath(cacheKey);
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(filePath, data);
}

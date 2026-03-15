import { buildSession, type Language } from "./affirmations";

export const ACTIVE_LANGUAGES = ["nl", "en"] as const;
export const PLANNED_LANGUAGES = ["fr", "de", "es", "it", "sv", "da", "no"] as const;

type BuildTrackOptions = {
  language: Language;
  targetMinutes?: number;
  pauseSeconds?: number;
  maxChunkChars?: number;
};

type TrackBuildResult = {
  text: string;
  chunks: string[];
  estimatedMinutes: number;
  targetMinutes: number;
  pauseSeconds: number;
};

const introByLanguage: Record<Language, string[]> = {
  nl: [
    "Ga maar rustig liggen. Je bent veilig in je bed.",
    "Adem zachtjes in en uit. Alles mag nu langzamer.",
    "Deze woorden helpen je lichaam en je hart om diep te ontspannen.",
  ],
  en: [
    "Lie down gently. You are safe in your bed.",
    "Breathe in softly and breathe out slowly. Everything can become calm now.",
    "These words help your body and your heart relax deeply.",
  ],
};

const closingByLanguage: Record<Language, string[]> = {
  nl: [
    "Je bent veilig. Je bent geliefd. Je bent goed zoals je bent.",
    "Nu mag je rustig verder slapen. Alles is goed.",
  ],
  en: [
    "You are safe. You are loved. You are good just as you are.",
    "Now you can keep sleeping peacefully. Everything is okay.",
  ],
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function estimateSpokenSeconds(line: string) {
  const words = line.trim().split(/\s+/).filter(Boolean).length;
  const secondsPerWord = 0.46;
  return words * secondsPerWord;
}

function pauseLine(language: Language, pauseSeconds: number) {
  if (language === "nl") {
    return `... rust ... (${pauseSeconds} seconden stilte) ...`;
  }
  return `... pause ... (${pauseSeconds} seconds of silence) ...`;
}

function splitIntoChunks(text: string, maxChars: number) {
  const lines = text.split("\n");
  const chunks: string[] = [];
  let current = "";

  for (const line of lines) {
    const next = current ? `${current}\n${line}` : line;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }

    if (current) {
      chunks.push(current);
      current = line;
      continue;
    }

    // Fallback when one line is already too long.
    chunks.push(line.slice(0, maxChars));
    current = line.slice(maxChars);
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.filter((chunk) => chunk.trim().length > 0);
}

export function buildStandardInnerSafetyTrack({
  language,
  targetMinutes = 35,
  pauseSeconds = 5,
  maxChunkChars = 2600,
}: BuildTrackOptions): TrackBuildResult {
  const safeTargetMinutes = clamp(targetMinutes, 30, 45);
  const safePauseSeconds = clamp(pauseSeconds, 4, 6);
  const session = buildSession(language);
  const pause = pauseLine(language, safePauseSeconds);
  const lines: string[] = [];

  let totalSeconds = 0;
  const targetSeconds = safeTargetMinutes * 60;

  for (const intro of introByLanguage[language]) {
    lines.push(intro, pause);
    totalSeconds += estimateSpokenSeconds(intro) + safePauseSeconds;
  }

  let loopIndex = 0;
  while (totalSeconds < targetSeconds - 70) {
    const second = session.secondPerson[loopIndex % session.secondPerson.length];
    const first =
      session.firstPerson[(loopIndex + 2) % session.firstPerson.length];

    lines.push(second, pause, first, pause);
    totalSeconds +=
      estimateSpokenSeconds(second) +
      safePauseSeconds +
      estimateSpokenSeconds(first) +
      safePauseSeconds;
    loopIndex += 1;
  }

  for (const close of closingByLanguage[language]) {
    lines.push(close, pause);
    totalSeconds += estimateSpokenSeconds(close) + safePauseSeconds;
  }

  const text = lines.join("\n");
  const chunks = splitIntoChunks(text, maxChunkChars);

  return {
    text,
    chunks,
    estimatedMinutes: Number((totalSeconds / 60).toFixed(1)),
    targetMinutes: safeTargetMinutes,
    pauseSeconds: safePauseSeconds,
  };
}

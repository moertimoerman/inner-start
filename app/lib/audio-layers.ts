export type AudioLayer = "voice" | "breathing" | "music";

export type VoiceSequenceItem =
  | { type: "sentence"; sentenceId: number }
  | { type: "silence"; src: string; label: string };

export const DUTCH_TEST_SENTENCES = [
  "Je bent veilig.",
  "Je bent hier veilig.",
  "Alles is rustig.",
  "Je lichaam mag ontspannen.",
  "Je schouders worden zacht.",
  "Je adem wordt langzaam.",
  "Je adem wordt rustig.",
  "Je mag rusten.",
];

export const SILENCE_3S_SRC = "/audio/silence3s.m4a";
export const SILENCE_7S_SRC = "/audio/silence7s.m4a";

// Layer plan:
// - voice: generated sentence clips (low credit, reusable)
// - breathing: subtle 4-in / 6-out cycle (automated synthesis placeholder)
// - music: separate ambient background file (independent layer)
export const AUDIO_LAYER_PLAN: Record<AudioLayer, { description: string }> = {
  voice: {
    description: "Sentence-level ElevenLabs clips + reusable silence assets",
  },
  breathing: {
    description:
      "Subtle synthesized swell/fade loop at 4s inhale / 6s exhale rhythm",
  },
  music: {
    description: "Separate ambient bed, mixed at low volume under voice",
  },
};

export const MUSIC_LAYER_SRC = "/audio/ambience.mp3";

export const BREATHING_LAYER_FILES = [
  "/audio/breathing/breathing-01.m4a",
  "/audio/breathing/breathing-02.m4a",
  "/audio/breathing/breathing-03.m4a",
  "/audio/breathing/breathing-04.m4a",
  "/audio/breathing/breathing-05.m4a",
  "/audio/breathing/breathing-06.m4a",
  "/audio/breathing/breathing-07.m4a",
  "/audio/breathing/breathing-08.m4a",
  "/audio/breathing/breathing-09.m4a",
  "/audio/breathing/breathing-10.m4a",
];

// breathing-08 original is very subtle; this boosted render is easier to hear in MVP testing.
export const DEFAULT_BREATHING_LAYER_SRC = "/audio/breathing/breathing-08-loud.m4a";

export function buildDutchVoicePacingSequence(): VoiceSequenceItem[] {
  return [
    { type: "sentence", sentenceId: 1 },
    { type: "silence", src: SILENCE_3S_SRC, label: "Silence 3s" },
    { type: "sentence", sentenceId: 2 },
    { type: "silence", src: SILENCE_3S_SRC, label: "Silence 3s" },
    { type: "sentence", sentenceId: 3 },
    { type: "silence", src: SILENCE_3S_SRC, label: "Silence 3s" },
    { type: "sentence", sentenceId: 4 },
    { type: "silence", src: SILENCE_7S_SRC, label: "Silence 7s" },
    { type: "sentence", sentenceId: 5 },
    { type: "silence", src: SILENCE_3S_SRC, label: "Silence 3s" },
    { type: "sentence", sentenceId: 6 },
    { type: "silence", src: SILENCE_3S_SRC, label: "Silence 3s" },
    { type: "sentence", sentenceId: 7 },
    { type: "silence", src: SILENCE_3S_SRC, label: "Silence 3s" },
    { type: "sentence", sentenceId: 8 },
    { type: "silence", src: SILENCE_7S_SRC, label: "Silence 7s" },
  ];
}

import type { VoiceProfile } from "./user-preferences";

export type PremiumAudioRequest = {
  voiceProfile: VoiceProfile;
  childName: string;
  language: "nl" | "en";
  scriptVersion: string;
};

export type PremiumAudioCacheKeyParts = {
  voiceProfile: VoiceProfile;
  childName: string;
  language: "nl" | "en";
  scriptVersion: string;
};

// Placeholder for premium architecture.
// Later this module will:
// 1) build a deterministic cache key per child + voice + script
// 2) read cached generated audio
// 3) generate TTS only on cache miss
// 4) store and reuse generated output
export function buildPremiumAudioCacheKey(input: PremiumAudioCacheKeyParts) {
  const normalizedName = input.childName.trim().toLowerCase();
  return `premium:${input.language}:${input.voiceProfile}:${input.scriptVersion}:${normalizedName}`;
}

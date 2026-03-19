import type { VoiceProfile } from "./user-preferences";

export type StandardVoiceConfig = {
  id: VoiceProfile;
  label: string;
  standardSrc: string;
};

// Standard MVP architecture:
// - one pre-generated reusable track per voice
// - no runtime TTS required for standard playback
// Future premium architecture:
// - generate personalized tracks (for child name)
// - cache generated output per child + voice + script version
export const STANDARD_VOICE_CONFIGS: StandardVoiceConfig[] = [
  {
    id: "female",
    label: "Vrouwenstem",
    standardSrc: "/audio/standard/female.m4a",
  },
  {
    id: "male",
    label: "Mannenstem",
    standardSrc: "/audio/standard/male.m4a",
  },
];

const VOICE_CONFIG_BY_ID = Object.fromEntries(
  STANDARD_VOICE_CONFIGS.map((config) => [config.id, config])
) as Record<VoiceProfile, StandardVoiceConfig>;

export function getStandardVoiceConfig(profile: VoiceProfile): StandardVoiceConfig {
  return VOICE_CONFIG_BY_ID[profile] ?? VOICE_CONFIG_BY_ID.female;
}

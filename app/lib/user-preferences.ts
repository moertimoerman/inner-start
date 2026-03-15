export type VoiceProfile = "female" | "male";
export type AppMixPreset = "soft" | "balanced" | "voice";

export type UserPreferences = {
  voiceProfile: VoiceProfile;
  mixPreset: AppMixPreset;
};

export const PREF_COOKIE_VOICE = "inner_voice_profile";
export const PREF_COOKIE_MIX = "inner_mix_preset";

export const DEFAULT_PREFERENCES: UserPreferences = {
  voiceProfile: "female",
  mixPreset: "balanced",
};

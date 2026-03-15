import { cookies } from "next/headers";
import {
  DEFAULT_PREFERENCES,
  PREF_COOKIE_MIX,
  PREF_COOKIE_VOICE,
  type AppMixPreset,
  type UserPreferences,
  type VoiceProfile,
} from "./user-preferences";

export async function getServerPreferences(): Promise<UserPreferences> {
  const cookieStore = await cookies();
  const voiceRaw = cookieStore.get(PREF_COOKIE_VOICE)?.value;
  const mixRaw = cookieStore.get(PREF_COOKIE_MIX)?.value;

  const voiceProfile: VoiceProfile =
    voiceRaw === "male" || voiceRaw === "female"
      ? voiceRaw
      : DEFAULT_PREFERENCES.voiceProfile;

  const mixPreset: AppMixPreset =
    mixRaw === "soft" || mixRaw === "balanced" || mixRaw === "voice"
      ? mixRaw
      : DEFAULT_PREFERENCES.mixPreset;

  return {
    voiceProfile,
    mixPreset,
  };
}

import { NextResponse } from "next/server";
import { type Language } from "../../lib/affirmations";
import { buildStandardInnerSafetyTrack } from "../../lib/track-builder";
import {
  createVoiceCacheKey,
  readVoiceClipFromCache,
  writeVoiceClipToCache,
} from "../../lib/voice-cache";

export const runtime = "nodejs";

function resolveVoiceId(
  requestedVoiceId: string | undefined,
  requestedVoiceProfile: string | undefined
) {
  if (requestedVoiceId?.trim()) return requestedVoiceId.trim();

  const defaultFemaleVoiceId =
    process.env.ELEVENLABS_VOICE_ID_FEMALE?.trim() ||
    process.env.ELEVENLABS_VOICE_ID?.trim() ||
    "EXAVITQu4vr4xnSDxMaL";

  // MVP voice profile mapping.
  // Future premium: support per-child custom voice selections.
  if (requestedVoiceProfile === "male") {
    return process.env.ELEVENLABS_VOICE_ID_MALE?.trim() || defaultFemaleVoiceId;
  }

  // Default path is female voice when no explicit preference exists.
  return defaultFemaleVoiceId;
}

function parseLanguage(value: string | null): Language {
  return value === "nl" ? "nl" : "en";
}

function parseTargetMinutes(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 35;
  return parsed;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");

  // TEMP DEBUG FLOW:
  // mode=script geeft lokaal een preview van de standaard track-text.
  // Zonder mode=script doet GET de ElevenLabs permissie-check (models_read).
  if (mode === "script") {
    const language = parseLanguage(searchParams.get("language"));
    const targetMinutes = parseTargetMinutes(searchParams.get("targetMinutes"));
    const pauseSeconds = Number(searchParams.get("pauseSeconds")) || 5;
    const track = buildStandardInnerSafetyTrack({
      language,
      targetMinutes,
      pauseSeconds,
    });

    return NextResponse.json({
      ok: true,
      mode: "script",
      language,
      targetMinutes: track.targetMinutes,
      estimatedMinutes: track.estimatedMinutes,
      pauseSeconds: track.pauseSeconds,
      chunks: track.chunks.length,
      previewText: track.chunks[0] ?? track.text,
    });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "ELEVENLABS_API_KEY ontbreekt in .env.local. Voeg de key toe en herstart de server.",
      },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://api.elevenlabs.io/v1/models", {
      method: "GET",
      headers: {
        "xi-api-key": apiKey,
      },
      signal: AbortSignal.timeout(12000),
    });

    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      // no-op
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          status: response.status,
          error: "ElevenLabs auth/permissie check mislukt.",
          providerResponse: data,
          hint: "Controleer in ElevenLabs dashboard of je key minimaal models_read en text-to-speech permissies heeft.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      ok: true,
      mode: "auth-debug",
      status: response.status,
      message: "ElevenLabs key werkt voor models endpoint.",
      modelsCount: Array.isArray(data) ? data.length : undefined,
      providerResponse: data,
    });
  } catch (error) {
    console.error("ELEVENLABS_DEBUG_GET_ERROR", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Kan ElevenLabs niet bereiken. Controleer internetverbinding en probeer opnieuw.",
      },
      { status: 502 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const language: Language =
      body?.language === "nl" || body?.language === "en" ? body.language : "en";
    const targetMinutes = Number(body?.targetMinutes) || 35;
    const pauseSeconds = Number(body?.pauseSeconds) || 5;
    const chunkIndex = Math.max(0, Number(body?.chunkIndex) || 0);
    const mode = body?.mode === "standard" ? "standard" : "tts";
    const inputText =
      typeof body?.text === "string" && body.text.trim() ? body.text.trim() : "";
    const requestedVoiceProfile =
      body?.voiceProfile === "male" || body?.voiceProfile === "female"
        ? body.voiceProfile
        : undefined;
    const requestedVoiceId =
      typeof body?.voiceId === "string" ? body.voiceId : undefined;

    let text = inputText;
    let totalChunks = 1;
    let estimatedMinutes = 0;

    if (mode === "standard" || !text) {
      const track = buildStandardInnerSafetyTrack({
        language,
        targetMinutes,
        pauseSeconds,
      });
      totalChunks = track.chunks.length;
      estimatedMinutes = track.estimatedMinutes;
      text = track.chunks[Math.min(chunkIndex, totalChunks - 1)] ?? track.chunks[0];
    }

    if (!text) {
      return NextResponse.json(
        { ok: false, error: "Geen geldige tekst ontvangen." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
    const voiceId = resolveVoiceId(requestedVoiceId, requestedVoiceProfile);

    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "ELEVENLABS_API_KEY ontbreekt in .env.local. Voeg een geldige key toe en herstart de server.",
        },
        { status: 500 }
      );
    }

    const modelId = "eleven_multilingual_v2";
    const voiceSettings = {
      stability: 0.65,
      similarity_boost: 0.7,
      style: 0.05,
      use_speaker_boost: true,
    };

    // Cache keeps identical sentence clips reusable across runs.
    // This reduces ElevenLabs calls and credits for repeated pacing tests.
    const cacheKey = createVoiceCacheKey({
      text,
      language,
      voiceId,
      modelId,
      voiceSettings,
    });

    const cachedClip = await readVoiceClipFromCache(cacheKey);
    if (cachedClip) {
      return new Response(cachedClip, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "no-store",
          "X-Inner-Cache": "HIT",
          "X-Inner-Chunk-Index": String(chunkIndex),
          "X-Inner-Chunk-Total": String(totalChunks),
          "X-Inner-Estimated-Minutes": String(estimatedMinutes),
        },
      });
    }

    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: voiceSettings,
        }),
        signal: AbortSignal.timeout(25000),
      }
    );

    if (!elevenLabsResponse.ok) {
      let providerError = "";
      try {
        const data = await elevenLabsResponse.json();
        providerError =
          typeof data?.detail === "string"
            ? data.detail
            : JSON.stringify(data ?? {});
      } catch {
        providerError = await elevenLabsResponse.text();
      }

      const status = elevenLabsResponse.status;
      let userMessage = `ElevenLabs error (${status}): ${providerError || "Onbekende fout."}`;

      if (status === 401 || status === 403) {
        userMessage =
          "ElevenLabs key is ongeldig of mist permissies. Update key-permissions in ElevenLabs dashboard.";
      } else if (status === 404) {
        userMessage =
          "Voice ID niet gevonden. Controleer ELEVENLABS_VOICE_ID in .env.local.";
      } else if (status === 429) {
        userMessage =
          "ElevenLabs quota/rate limit bereikt. Probeer later opnieuw of upgrade plan.";
      }

      return NextResponse.json(
        {
          ok: false,
          error: userMessage,
          providerError,
        },
        { status }
      );
    }

    const audioBuffer = await elevenLabsResponse.arrayBuffer();
    const audioBytes = Buffer.from(audioBuffer);
    await writeVoiceClipToCache(cacheKey, audioBytes);

    return new Response(audioBytes, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        "X-Inner-Cache": "MISS",
        "X-Inner-Chunk-Index": String(chunkIndex),
        "X-Inner-Chunk-Total": String(totalChunks),
        "X-Inner-Estimated-Minutes": String(estimatedMinutes),
      },
    });
  } catch (error) {
    console.error("VOICE_ROUTE_POST_ERROR", error);
    return NextResponse.json(
      { ok: false, error: "Serverfout bij voice generation." },
      { status: 500 }
    );
  }
}

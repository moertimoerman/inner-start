type TrackPayload = {
  event: string;
  distinctId: string;
  properties?: Record<string, unknown>;
};

export async function trackServerEvent({
  event,
  distinctId,
  properties = {},
}: TrackPayload) {
  const payload = {
    event,
    distinct_id: distinctId,
    properties: {
      ...properties,
      source: "inner-start",
      timestamp: new Date().toISOString(),
    },
  };

  // Always emit to server logs (minimal internal tracking).
  console.log("TRACK_EVENT", JSON.stringify(payload));

  const apiKey = process.env.POSTHOG_API_KEY;
  if (!apiKey) return;

  const host = process.env.POSTHOG_HOST || "https://eu.i.posthog.com";
  try {
    await fetch(`${host}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        event,
        distinct_id: distinctId,
        properties: payload.properties,
      }),
    });
  } catch (error) {
    console.error("POSTHOG_TRACK_ERROR", error);
  }
}

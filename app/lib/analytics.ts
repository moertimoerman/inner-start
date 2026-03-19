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

  const posthogApiKey = process.env.POSTHOG_API_KEY;
  const posthogHost = process.env.POSTHOG_HOST || "https://eu.i.posthog.com";
  const gaMeasurementId = process.env.GA4_MEASUREMENT_ID;
  const gaApiSecret = process.env.GA4_API_SECRET;

  if (posthogApiKey) {
    try {
      await fetch(`${posthogHost}/capture/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: posthogApiKey,
          event,
          distinct_id: distinctId,
          properties: payload.properties,
        }),
      });
    } catch (error) {
      console.error("POSTHOG_TRACK_ERROR", error);
    }
  }

  // Optional GA4 Measurement Protocol mirror.
  // Enabled only when GA4_MEASUREMENT_ID and GA4_API_SECRET are configured.
  if (gaMeasurementId && gaApiSecret) {
    try {
      await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(
          gaMeasurementId
        )}&api_secret=${encodeURIComponent(gaApiSecret)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: distinctId,
            events: [
              {
                name: event,
                params: payload.properties,
              },
            ],
          }),
        }
      );
    } catch (error) {
      console.error("GA4_TRACK_ERROR", error);
    }
  }
}

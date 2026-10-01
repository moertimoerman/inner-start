export const isClerkConfigured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
      process.env.CLERK_SECRET_KEY?.trim()
  );

export const isStripeConfigured = () =>
  Boolean(process.env.STRIPE_SECRET_KEY?.trim());

export function getAppUrl(requestOrigin?: string) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configured) {
    const url = new URL(configured);
    if (url.protocol !== "https:" && url.hostname !== "localhost") {
      throw new Error("NEXT_PUBLIC_APP_URL must use https in production.");
    }
    return url.origin;
  }

  if (process.env.NODE_ENV !== "production" && requestOrigin) {
    return new URL(requestOrigin).origin;
  }

  throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
}

export function safeInternalPath(value: string | null | undefined, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/app",
  "/dashboard",
  "/setup",
  "/api/access-status",
  "/api/audio",
  "/api/billing-portal",
  "/api/checkout",
];

const withClerk = clerkMiddleware();

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const developmentOnlyRoutes = ["/audio-dashboard", "/test-player", "/test-voice"];
  if (
    process.env.NODE_ENV === "production" &&
    developmentOnlyRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
  ) {
    return new NextResponse(null, { status: 404 });
  }

  if (request.nextUrl.pathname.startsWith("/audio/")) {
    return new NextResponse(null, { status: 404 });
  }

  const clerkConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
      process.env.CLERK_SECRET_KEY?.trim()
  );

  if (!clerkConfigured) {
    if (!isProtectedPath(request.nextUrl.pathname)) return NextResponse.next();

    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Inloggen is nog niet geconfigureerd." },
        { status: 503 }
      );
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return withClerk(request, event);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/(api|trpc)(.*)",
  ],
};

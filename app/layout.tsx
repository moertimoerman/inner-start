import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { MainNav } from "../components/MainNav";
import { SiteFooter } from "../components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inner Sleep — Rustige luisterroutine voor het slapengaan",
  description:
    "Een rustige luisterroutine voor het slapengaan, met kalme gesproken boodschappen en zacht sound design.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const clerkConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
      process.env.CLERK_SECRET_KEY?.trim()
  );

  const app = (
    <>
      <MainNav authEnabled={clerkConfigured} />
      {children}
      <SiteFooter />
    </>
  );

  return (
    <html lang="nl">
      <body>
        {clerkConfigured ? (
          <ClerkProvider signInUrl="/login" signUpUrl="/registreren">
            {app}
          </ClerkProvider>
        ) : (
          app
        )}
      </body>
    </html>
  );
}

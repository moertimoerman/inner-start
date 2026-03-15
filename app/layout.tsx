import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, DM_Sans, DM_Mono } from "next/font/google";
import { MainNav } from "../components/MainNav";
import { SiteFooter } from "../components/SiteFooter";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Inner Sleep — Rustige en veilige slaaproutine voor kinderen",
  description:
    "Inner Sleep helpt kinderen rustiger in slaap te vallen en van binnen steviger te worden, met kalme gesproken suggesties, slim sound design en een veilige slaaproutine.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="nl"
      className={`${cormorant.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <body>
        <MainNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

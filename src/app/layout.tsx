import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Dentai — Dentistry that feels unhurried",
    template: "%s · Dentai",
  },
  description:
    "Dentai is a modern dental clinic in SoHo, New York, pairing calm, considered care with a clinical platform built for the whole practice.",
  metadataBase: new URL("https://dentai-clinic-platform.vercel.app"),
  openGraph: {
    title: "Dentai — Dentistry that feels unhurried",
    description:
      "General, cosmetic and restorative dentistry in SoHo, New York. Calm rooms, clear plans, no waiting-room rush.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">{children}</body>
    </html>
  );
}

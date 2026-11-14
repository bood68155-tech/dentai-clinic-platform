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
    default: "NUV — Dentistry that feels unhurried",
    template: "%s · NUV",
  },
  description:
    "NUV is a modern dental clinic in Khan Yunis, Gaza, pairing calm, considered care with a clinical platform built for the whole practice.",
  metadataBase: new URL("https://nuv-clinic-platform.vercel.app"),
  openGraph: {
    title: "NUV — Dentistry that feels unhurried",
    description:
      "General, cosmetic and restorative dentistry in Khan Yunis, Gaza. Calm rooms, clear plans, no waiting-room rush.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        {children}
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
// Self-hosted Geist (npm `geist` package): builds never depend on Google's
// CDN being reachable — fonts ship with the app.
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { strings } from "@/lib/strings";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${strings.brand.name} — ${strings.brand.tagline}`,
    template: `%s · ${strings.brand.name}`,
  },
  description: strings.landing.heroSubtitle,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}

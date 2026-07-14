import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { strings } from "@/lib/strings";

import "./globals.css";

// globals.css maps the theme's font tokens to these variables.
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}

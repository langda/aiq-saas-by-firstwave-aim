import { ImageResponse } from "next/og";

import * as certificates from "@/features/certificates/server/service";
import { ShareCard } from "@/features/certificates/server/share-card";

/**
 * Share card v2 on the verify link (UX Phase C): identity + achievement
 * level, zero analytics, 3-second read. Same disclosure rules as the page.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AIQ — AI Work Style & Readiness Assessment";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const verification = await certificates.getPublicVerification(code);
  return new ImageResponse(
    <ShareCard verification={verification} variant="og" />,
    size,
  );
}

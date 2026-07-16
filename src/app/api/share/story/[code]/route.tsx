import { ImageResponse } from "next/og";

import * as certificates from "@/features/certificates/server/service";
import { ShareCard } from "@/features/certificates/server/share-card";

/**
 * Instagram-Story-ratio share image (1080×1920) — downloadable identity card.
 * Public and disclosure-safe (level + persona only, never scores).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const verification = await certificates.getPublicVerification(code);
  return new ImageResponse(
    <ShareCard verification={verification} variant="story" />,
    { width: 1080, height: 1920 },
  );
}

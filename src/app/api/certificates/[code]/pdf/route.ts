import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse, type NextRequest } from "next/server";
import QRCode from "qrcode";

import { CertificateDocument } from "@/features/certificates/server/pdf";
import * as certificates from "@/features/certificates/server/service";
import { getAchievement } from "@/lib/achievements";
import { getAuthContext } from "@/lib/auth/context";

/**
 * Certificate PDF — HOLDER ONLY (§13): the PDF carries the overall score,
 * which the public code deliberately does not disclose. Generated on demand
 * so template fixes apply retroactively.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const ctx = await getAuthContext();
  if (!ctx)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const record = await certificates.getHolderCertificate(ctx, code);
  if (!record)
    return NextResponse.json({ error: "not_found" }, { status: 404 });

  const verifyUrl = `${request.nextUrl.origin}/verify/${record.publicCode}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 240,
  });

  const buffer = await renderToBuffer(
    CertificateDocument({
      holderName: record.holderName ?? "AIQ Participant",
      personaName: record.personaName ?? "—",
      personaDescription: record.personaDescription ?? "",
      overallScore: record.overallScore,
      achievement: getAchievement(record.overallScore),
      assessmentTitle: record.assessmentTitle,
      issuedAt: record.issuedAt,
      verifyUrl,
      qrDataUrl,
    }),
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="aiq-certificate-${record.publicCode}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}

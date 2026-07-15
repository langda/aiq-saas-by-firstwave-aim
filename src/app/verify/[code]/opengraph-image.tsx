import { ImageResponse } from "next/og";

import * as certificates from "@/features/certificates/server/service";

/**
 * Share card for the verify link (the growth surface — SESSION_1_REVIEW A4.1).
 * Persona-forward; follows the public disclosure rules (Decision 6): no score.
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
  const valid = verification && verification.status === "valid";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "linear-gradient(135deg, #eef2ff 0%, #ffffff 55%)",
        color: "#171717",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 40, fontWeight: 700, color: "#4f46e5" }}>
          AIQ
        </div>
        <div style={{ fontSize: 20, color: "#6b7280", letterSpacing: 2 }}>
          AI WORK STYLE & READINESS ASSESSMENT
        </div>
      </div>

      {valid ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 28, color: "#6b7280" }}>
            {verification.holderName ?? "Certified"}
          </div>
          <div style={{ fontSize: 88, fontWeight: 700, marginTop: 8 }}>
            {verification.personaName}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 56, fontWeight: 700 }}>
          Discover your AI work style
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 22,
          color: "#6b7280",
        }}
      >
        <div>Verified certificate</div>
        {valid && (
          <div>
            {new Date(verification.issuedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        )}
      </div>
    </div>,
    size,
  );
}

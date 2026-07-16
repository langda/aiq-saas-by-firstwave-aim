import "server-only";

import type { PublicVerification } from "./service";

/**
 * The share card (UX_PHILOSOPHY: identity, never analytics — 3-second read).
 * One JSX tree rendered by next/og at both OG (1200×630) and story (1080×1920)
 * ratios. Stars are inline SVG — font glyphs are unreliable in Satori.
 */

const INDIGO = "#4f46e5";
const STAR_PATH =
  "M12 2l2.9 6.26 6.6.7-4.9 4.5 1.35 6.54L12 16.9 6.05 20l1.35-6.54-4.9-4.5 6.6-.7L12 2z";

function Stars({ filled, size }: { filled: number; size: number }) {
  return (
    <div style={{ display: "flex", gap: size / 4 }}>
      {[0, 1, 2, 3, 4].map((index) => (
        <svg
          key={index}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={index < filled ? "#fbbf24" : "rgba(255,255,255,0.25)"}
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}

export function ShareCard({
  verification,
  variant,
}: {
  verification: PublicVerification | null;
  variant: "og" | "story";
}) {
  const story = variant === "story";
  const valid = verification && verification.status === "valid";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: story ? 48 : 28,
        background: `linear-gradient(150deg, ${INDIGO} 0%, #7c3aed 60%, #312e81 100%)`,
        color: "#ffffff",
        fontFamily: "sans-serif",
        padding: story ? 96 : 64,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: story ? 44 : 32,
          fontWeight: 700,
          letterSpacing: 6,
          opacity: 0.85,
        }}
      >
        AIQ
      </div>

      {valid ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: story ? 40 : 22,
          }}
        >
          <div style={{ fontSize: story ? 40 : 28, opacity: 0.8 }}>
            {verification.holderName ?? "My AI work style"}
          </div>
          <div
            style={{
              fontSize: story ? 110 : 92,
              fontWeight: 700,
              lineHeight: 1.05,
            }}
          >
            {verification.personaName}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <Stars
              filled={verification.achievement.stars}
              size={story ? 52 : 36}
            />
            <div style={{ fontSize: story ? 44 : 30, fontWeight: 600 }}>
              {verification.achievement.name}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: story ? 84 : 64, fontWeight: 700 }}>
          Discover your AI work style
        </div>
      )}

      <div style={{ fontSize: story ? 30 : 22, opacity: 0.7 }}>
        {valid ? "I discovered my AI work style — what's yours?" : "aiq"}
      </div>
    </div>
  );
}

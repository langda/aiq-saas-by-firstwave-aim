import "server-only";

import {
  Document,
  Image,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";

import type { AchievementLevel } from "@/lib/achievements";

/**
 * Certificate PDF template (Decision 6 holder view: name, persona, overall
 * score, date, QR verification). A React component, so future branding
 * (Phase 7) is a props change, not a rewrite.
 */

const INDIGO = "#4f46e5";
const INK = "#171717";
const MUTED = "#6b7280";

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    color: INK,
    backgroundColor: "#ffffff",
  },
  frame: {
    flex: 1,
    borderWidth: 2,
    borderColor: INDIGO,
    borderRadius: 12,
    padding: 40,
    display: "flex",
    flexDirection: "column",
  },
  brand: { fontSize: 20, fontFamily: "Helvetica-Bold", color: INDIGO },
  tagline: { fontSize: 9, color: MUTED, marginTop: 2, letterSpacing: 1 },
  center: { marginTop: 48, display: "flex", alignItems: "center" },
  label: { fontSize: 10, color: MUTED, letterSpacing: 2, marginBottom: 8 },
  name: { fontSize: 30, fontFamily: "Helvetica-Bold" },
  persona: {
    fontSize: 22,
    color: INDIGO,
    marginTop: 20,
    fontFamily: "Helvetica-Bold",
  },
  personaDescription: {
    fontSize: 11,
    color: MUTED,
    marginTop: 8,
    maxWidth: 360,
    textAlign: "center",
    lineHeight: 1.5,
  },
  score: { fontSize: 13, marginTop: 16 },
  levelRow: {
    marginTop: 18,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  levelName: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  footer: {
    marginTop: "auto",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  footerText: { fontSize: 9, color: MUTED, lineHeight: 1.6 },
  qr: { width: 76, height: 76 },
});

const STAR_PATH =
  "M12 2l2.9 6.26 6.6.7-4.9 4.5 1.35 6.54L12 16.9 6.05 20l1.35-6.54-4.9-4.5 6.6-.7L12 2z";

function StarRow({ filled }: { filled: number }) {
  return (
    <View style={{ display: "flex", flexDirection: "row", gap: 3 }}>
      {[0, 1, 2, 3, 4].map((index) => (
        <Svg key={index} width={16} height={16} viewBox="0 0 24 24">
          <Path d={STAR_PATH} fill={index < filled ? "#f59e0b" : "#e5e7eb"} />
        </Svg>
      ))}
    </View>
  );
}

export function CertificateDocument(props: {
  holderName: string;
  personaName: string;
  personaDescription: string;
  overallScore: number;
  achievement: AchievementLevel;
  assessmentTitle: string;
  issuedAt: string;
  verifyUrl: string;
  qrDataUrl: string;
}) {
  return (
    <Document title={`AIQ Certificate — ${props.holderName}`}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.frame}>
          <View>
            <Text style={styles.brand}>AIQ</Text>
            <Text style={styles.tagline}>
              AI WORK STYLE & READINESS ASSESSMENT
            </Text>
          </View>

          <View style={styles.center}>
            <Text style={styles.label}>THIS CERTIFIES THAT</Text>
            <Text style={styles.name}>{props.holderName}</Text>
            <Text style={styles.persona}>{props.personaName}</Text>
            <Text style={styles.personaDescription}>
              {props.personaDescription}
            </Text>
            <View style={styles.levelRow}>
              <StarRow filled={props.achievement.stars} />
              <Text style={styles.levelName}>{props.achievement.name}</Text>
            </View>
            <Text style={styles.score}>
              Overall score {props.overallScore} / 100 · {props.assessmentTitle}
            </Text>
          </View>

          <View style={styles.footer}>
            <View>
              <Text style={styles.footerText}>
                Issued{" "}
                {new Date(props.issuedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
              <Text style={styles.footerText}>Verify: {props.verifyUrl}</Text>
            </View>
            {/* QR encodes the public verify URL (persona + date only — §13).
                react-pdf's Image is not a DOM <img>; alt does not exist here. */}
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image style={styles.qr} src={props.qrDataUrl} />
          </View>
        </View>
      </Page>
    </Document>
  );
}

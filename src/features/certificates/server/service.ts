import "server-only";

import { canViewOwnResults } from "@/core/authz";
import type { AuthContext } from "@/core/types";
import { generatePublicCode } from "@/lib/ids";

import * as db from "./db";
import { sendCertificateIssuedEmail } from "./email";

/**
 * Certificate engine (ARCHITECTURE §13, Decision 6): every completion earns
 * one; no expiry. Two disclosure levels:
 *  - HOLDER (owner, permanent account): full certificate incl. overall score.
 *  - PUBLIC (verify page / share image): name, persona, date, status — never
 *    the score or competency detail.
 */

/** Issue at submit time. Idempotent per result. */
export async function issueCertificate(input: {
  resultId: string;
  userId: string;
}): Promise<void> {
  const publicCode = generatePublicCode();
  await db.insertCertificate({
    publicCode,
    resultId: input.resultId,
    userId: input.userId,
  });
  // Fire-and-forget notification (Resend): a failed or unconfigured email
  // must never fail a submit.
  void sendCertificateIssuedEmail(publicCode).catch((error) =>
    console.error("certificate email failed", error),
  );
}

export type PublicVerification = {
  status: "valid" | "revoked";
  holderName: string | null;
  personaName: string | null;
  personaArtworkUrl: string | null;
  assessmentTitle: string;
  issuedAt: string;
};

/** The ONLY shape the public surfaces may render (Decision 6). */
export async function getPublicVerification(
  code: string,
): Promise<PublicVerification | null> {
  if (!/^[1-9A-HJ-NP-Za-km-z]{10,40}$/.test(code)) return null;
  const record = await db.getCertificateByCode(code);
  if (!record) return null;
  return {
    status: record.revokedAt ? "revoked" : "valid",
    holderName: record.holderName,
    personaName: record.personaName,
    personaArtworkUrl: record.personaArtworkUrl,
    assessmentTitle: record.assessmentTitle,
    issuedAt: record.issuedAt,
  };
}

/** Holder-only detail for the PDF: requires the signed-in owner. */
export async function getHolderCertificate(ctx: AuthContext, code: string) {
  if (!canViewOwnResults(ctx)) return null;
  const record = await db.getCertificateByCode(code);
  if (!record || record.revokedAt) return null;
  // Ownership check: the RLS-scoped owner read must agree with the code.
  const session = await ownerHoldsCode(record);
  if (!session) return null;
  return record;

  async function ownerHoldsCode(r: { publicCode: string }) {
    // The cookie-bound client only sees the caller's own certificates (RLS).
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("certificates")
      .select("public_code")
      .eq("public_code", r.publicCode)
      .maybeSingle();
    return data !== null;
  }
}

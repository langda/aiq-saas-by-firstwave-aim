import "server-only";

import { isEmailConfigured, sendEmail } from "@/lib/email";
import { serverEnv } from "@/lib/env.server";

import * as db from "./db";

/**
 * Certificate-issued email (Resend — closes OPEN_QUESTIONS F). Best-effort
 * enhancement: anonymous users have no email yet, unconfigured environments
 * skip entirely — neither may ever affect the submit flow.
 */
export async function sendCertificateIssuedEmail(
  publicCode: string,
): Promise<void> {
  if (!isEmailConfigured()) return;

  const record = await db.getCertificateByCode(publicCode);
  if (!record || record.revokedAt) return;

  const admin = (await import("@/lib/supabase/admin")).createAdminClient();
  const { data: cert } = await admin
    .from("certificates")
    .select("user_id")
    .eq("public_code", publicCode)
    .maybeSingle();
  if (!cert) return;
  const { data: profile } = await admin
    .from("profiles")
    .select("email")
    .eq("id", cert.user_id)
    .maybeSingle();
  if (!profile?.email) return;

  const origin = serverEnv.APP_URL ?? "http://localhost:3000";
  const verifyUrl = `${origin}/verify/${publicCode}`;

  await sendEmail({
    to: profile.email,
    subject: `Your AIQ certificate — ${record.personaName ?? "your AI work style"}`,
    html: `
      <div style="font-family: -apple-system, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; color: #171717;">
        <p style="color: #4f46e5; font-weight: 700; font-size: 18px;">AIQ</p>
        <h1 style="font-size: 22px;">Your certificate is ready${record.holderName ? `, ${record.holderName}` : ""}</h1>
        <p>Your AI work style: <strong>${record.personaName ?? "—"}</strong>.</p>
        <p>Share your verification link — it shows your work style and date, never your scores:</p>
        <p><a href="${verifyUrl}" style="color: #4f46e5;">${verifyUrl}</a></p>
        <p style="color: #6b7280; font-size: 13px;">Download the full PDF certificate from your results page.</p>
      </div>
    `,
  });
}

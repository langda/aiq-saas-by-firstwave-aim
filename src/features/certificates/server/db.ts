import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Certificates data layer. Issuance and public verification use the service
 * client (no client write policy exists; verification is unauthenticated by
 * design). Owner reads go through RLS.
 */

export async function insertCertificate(input: {
  publicCode: string;
  resultId: string;
  userId: string;
}) {
  const admin = createAdminClient();
  // Idempotent: one certificate per result (unique result_id).
  const { error } = await admin.from("certificates").upsert(
    {
      public_code: input.publicCode,
      result_id: input.resultId,
      user_id: input.userId,
    },
    { onConflict: "result_id", ignoreDuplicates: true },
  );
  if (error) throw error;
}

/** Owner view: certificate for a session's result (RLS: permanent owner only). */
export async function getCertificateForSession(sessionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("certificates")
    .select("public_code, issued_at, revoked_at, results!inner(session_id)")
    .eq("results.session_id", sessionId)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as {
    public_code: string;
    issued_at: string;
    revoked_at: string | null;
  } | null;
}

/** Certificate code for a session (service client — used post-claim, where
 *  ownership was just established by the claim token). */
export async function getCertificateCodeBySession(
  sessionId: string,
): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("certificates")
    .select("public_code, results!inner(session_id)")
    .eq("results.session_id", sessionId)
    .maybeSingle();
  if (error) throw error;
  return (
    (data as unknown as { public_code: string } | null)?.public_code ?? null
  );
}

export type VerificationRecord = {
  publicCode: string;
  issuedAt: string;
  revokedAt: string | null;
  holderName: string | null;
  personaName: string | null;
  personaDescription: string | null;
  personaArtworkUrl: string | null;
  overallScore: number;
  assessmentTitle: string;
};

/**
 * PUBLIC verification lookup (service client — page is unauthenticated).
 * Returns the full record; the SERVICE decides what each surface may show
 * (Decision 6: verify page gets name/persona/date, never the score).
 */
export async function getCertificateByCode(
  code: string,
): Promise<VerificationRecord | null> {
  const admin = createAdminClient();
  const { data: raw, error } = await admin
    .from("certificates")
    .select(
      "public_code, issued_at, revoked_at, user_id, results!inner(overall_score, persona_id, session_id)",
    )
    .eq("public_code", code)
    .maybeSingle();
  if (error) throw error;
  if (!raw) return null;

  // Join typing needs generated relationship metadata — explicit until then.
  const data = raw as unknown as {
    public_code: string;
    issued_at: string;
    revoked_at: string | null;
    user_id: string;
    results: { overall_score: number; persona_id: string; session_id: string };
  };
  const result = data.results;

  const [profile, persona, session] = await Promise.all([
    admin
      .from("profiles")
      .select("full_name")
      .eq("id", data.user_id)
      .maybeSingle(),
    admin
      .from("personas")
      .select("name, description, artwork_url")
      .eq("id", result.persona_id)
      .maybeSingle(),
    admin
      .from("assessment_sessions")
      .select("assessment_id, assessments!inner(title)")
      .eq("id", result.session_id)
      .maybeSingle(),
  ] as const);

  return {
    publicCode: data.public_code,
    issuedAt: data.issued_at,
    revokedAt: data.revoked_at,
    holderName: profile.data?.full_name ?? null,
    personaName: persona.data?.name ?? null,
    personaDescription: persona.data?.description ?? null,
    personaArtworkUrl: persona.data?.artwork_url ?? null,
    overallScore: result.overall_score,
    assessmentTitle:
      (
        session.data as unknown as {
          assessments: { title: string } | null;
        } | null
      )?.assessments?.title ?? "AIQ Work Style Assessment",
  };
}

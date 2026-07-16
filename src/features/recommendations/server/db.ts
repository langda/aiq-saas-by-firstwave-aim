import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

import type { FallbackTemplate } from "../fallback";

/**
 * Recommendations data layer. Generation runs post-response with no user
 * session (service client); user-facing reads go through RLS.
 */

export async function insertPending(resultId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("ai_recommendations")
    .upsert(
      { result_id: resultId, status: "pending" },
      { onConflict: "result_id", ignoreDuplicates: true },
    );
  if (error) throw error;
}

export async function getStatus(resultId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ai_recommendations")
    .select("status")
    .eq("result_id", resultId)
    .maybeSingle();
  if (error) throw error;
  return data?.status ?? null;
}

export async function storeGenerated(input: {
  resultId: string;
  content: unknown;
  model: string;
  promptVersion: string | null;
}) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("ai_recommendations")
    .update({
      status: "generated",
      content: input.content as never,
      model: input.model,
      prompt_version: input.promptVersion,
    })
    .eq("result_id", input.resultId);
  if (error) throw error;
}

export async function markFailed(resultId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("ai_recommendations")
    .update({ status: "failed" })
    .eq("result_id", resultId);
  if (error) throw error;
}

/** Everything the generator needs about a result, in one read. */
export async function getResultSummary(resultId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("results")
    .select(
      "id, overall_score, competency_scores, persona_id, strengths, blind_spots, confidence",
    )
    .eq("id", resultId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const [personas, competencies] = await Promise.all([
    admin.from("personas").select("id, slug, name, description"),
    admin.from("competencies").select("slug, name"),
  ]);
  if (personas.error) throw personas.error;
  if (competencies.error) throw competencies.error;

  return {
    result: data,
    persona: personas.data.find((p) => p.id === data.persona_id) ?? null,
    competencyNames: new Map(competencies.data.map((c) => [c.slug, c.name])),
  };
}

export async function getTemplates(): Promise<FallbackTemplate[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("recommendation_templates")
    .select("title, why, how, competencies ( slug )");
  if (error) throw error;
  return (
    (data ?? []) as unknown as Array<{
      title: string;
      why: string;
      how: string;
      competencies: { slug: string } | null;
    }>
  ).map((row) => ({
    competencySlug: row.competencies?.slug ?? "",
    title: row.title,
    why: row.why,
    how: row.how,
  }));
}

/** User-facing read — RLS enforces owner + permanent account. */
export async function getRecommendationForSession(sessionId: string) {
  const supabase = await createClient();
  const { data: result, error: resultError } = await supabase
    .from("results")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (resultError) throw resultError;
  if (!result) return null;

  const { data, error } = await supabase
    .from("ai_recommendations")
    .select("status, content")
    .eq("result_id", result.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

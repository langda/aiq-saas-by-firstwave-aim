import "server-only";

import type { SignalInput } from "@/core/scoring/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

import { servedQuestionsSchema, type ServedQuestions } from "../schemas";

/**
 * All Supabase queries for the assessment feature. User-scoped reads/writes
 * use the cookie-bound client (RLS as the user); signal/config reads and
 * result writes use the admin client — only after the service has authorized.
 */

export async function getPublishedAssessment(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assessments")
    .select(
      "id, slug, title, description, question_count, selection_strategy, settings",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAssessmentQuestionPool(assessmentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assessment_questions")
    .select("question_id, position")
    .eq("assessment_id", assessmentId);
  if (error) throw error;
  return data;
}

export type QuestionWithOptions = {
  id: string;
  title: string;
  scenario: string;
  version: number;
  answer_options: Array<{ id: string; content: string }>;
};

export async function getPublishedQuestionsWithOptions(
  questionIds: string[],
): Promise<QuestionWithOptions[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("questions")
    .select("id, title, scenario, version, answer_options ( id, content )")
    .in("id", questionIds)
    .eq("status", "published");
  if (error) throw error;
  // Join typing needs relationship metadata that only generated types carry —
  // hand-typed until `npm run db:types` replaces database.types.ts.
  return (data ?? []) as unknown as QuestionWithOptions[];
}

export async function getActiveSession(userId: string, assessmentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assessment_sessions")
    .select("id, status, served_questions, seed, scoring_config_id")
    .eq("user_id", userId)
    .eq("assessment_id", assessmentId)
    .eq("status", "in_progress")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getLatestCompletedSession(
  userId: string,
  assessmentId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assessment_sessions")
    .select("id, completed_at")
    .eq("user_id", userId)
    .eq("assessment_id", assessmentId)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getSessionById(sessionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assessment_sessions")
    .select(
      "id, user_id, assessment_id, status, served_questions, seed, scoring_config_id, completed_at",
    )
    .eq("id", sessionId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createSession(input: {
  userId: string;
  assessmentId: string;
  servedQuestions: ServedQuestions;
  seed: string;
  scoringConfigId: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assessment_sessions")
    .insert({
      user_id: input.userId,
      assessment_id: input.assessmentId,
      served_questions: input.servedQuestions,
      seed: input.seed,
      scoring_config_id: input.scoringConfigId,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

export async function upsertResponse(input: {
  sessionId: string;
  questionId: string;
  optionId: string;
  timeSpentMs?: number;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("responses").upsert(
    {
      session_id: input.sessionId,
      question_id: input.questionId,
      option_id: input.optionId,
      time_spent_ms: input.timeSpentMs ?? null,
      answered_at: new Date().toISOString(),
    },
    { onConflict: "session_id,question_id" },
  );
  if (error) throw error;
}

export async function getSessionResponses(sessionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("responses")
    .select("question_id, option_id")
    .eq("session_id", sessionId);
  if (error) throw error;
  return data;
}

/** SERVER-ONLY signal read (RLS denies clients). Requires prior authorization. */
export async function getSignalsForOptions(
  optionIds: string[],
): Promise<SignalInput[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("option_signals")
    .select("option_id, weight, competencies ( slug )")
    .in("option_id", optionIds);
  if (error) throw error;
  const rows = (data ?? []) as unknown as Array<{
    option_id: string;
    weight: number;
    competencies: { slug: string } | null;
  }>;
  return rows.map((row) => ({
    optionId: row.option_id,
    competencySlug: row.competencies?.slug ?? "",
    weight: Number(row.weight),
  }));
}

export async function getScoringConfig(configId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("scoring_configs")
    .select("id, version, config")
    .eq("id", configId)
    .single();
  if (error) throw error;
  return data;
}

export async function getActiveScoringConfig() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("scoring_configs")
    .select("id, version, config")
    .eq("status", "active")
    .single();
  if (error) throw error;
  return data;
}

export async function getPersonaIdsBySlug(slugs: string[]) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("personas")
    .select("id, slug")
    .in("slug", slugs);
  if (error) throw error;
  return new Map((data ?? []).map((p) => [p.slug, p.id]));
}

/** Result write + session completion. Admin client: no client insert policy exists. */
export async function persistResult(input: {
  sessionId: string;
  userId: string;
  overallScore: number;
  competencyScores: Record<string, number | null>;
  personaId: string;
  secondaryPersonaId: string | null;
  personaAffinities: unknown;
  strengths: string[];
  blindSpots: string[];
  confidence: unknown;
  scoringConfigId: string;
  scoringSnapshot: unknown;
  claimToken: string;
}) {
  const admin = createAdminClient();
  const { data: result, error } = await admin
    .from("results")
    .insert({
      session_id: input.sessionId,
      user_id: input.userId,
      overall_score: input.overallScore,
      competency_scores: input.competencyScores,
      persona_id: input.personaId,
      secondary_persona_id: input.secondaryPersonaId,
      persona_affinities: input.personaAffinities as never,
      strengths: input.strengths,
      blind_spots: input.blindSpots,
      confidence: input.confidence as never,
      scoring_config_id: input.scoringConfigId,
      scoring_snapshot: input.scoringSnapshot as never,
    })
    .select("id")
    .single();
  if (error) throw error;

  const { error: sessionError } = await admin
    .from("assessment_sessions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      claim_token: input.claimToken,
    })
    .eq("id", input.sessionId);
  if (sessionError) throw sessionError;

  return result;
}

export async function getExistingResult(sessionId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("results")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function logEvent(input: {
  type: string;
  userId?: string;
  sessionId?: string;
  payload?: Record<string, unknown>;
}) {
  const admin = createAdminClient();
  // Best-effort telemetry: never let an events failure break the user flow.
  const { error } = await admin.from("events").insert({
    type: input.type,
    user_id: input.userId ?? null,
    session_id: input.sessionId ?? null,
    payload: (input.payload ?? {}) as never,
  });
  if (error) console.error("events insert failed", error.message);
}

export function parseServedQuestions(raw: unknown): ServedQuestions {
  return servedQuestionsSchema.parse(raw);
}

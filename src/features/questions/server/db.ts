import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Question-authoring data layer. Runs as the signed-in super_admin through
 * the cookie client (RLS exercised); the service client appears exactly once,
 * for the response-count guardrail (responses have owner-only policies).
 */

export async function listQuestions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("questions")
    .select("id, title, status, version, industry_tags")
    .order("title");
  if (error) throw error;
  return data;
}

export type FullQuestion = {
  id: string;
  title: string;
  scenario: string;
  status: string;
  version: number;
  difficulty: number;
  industry_tags: string[];
  answer_options: Array<{
    id: string;
    content: string;
    author_position: number;
    option_signals: Array<{
      id: string;
      competency_id: string;
      weight: number;
    }>;
  }>;
};

export async function getFullQuestion(
  id: string,
): Promise<FullQuestion | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("questions")
    .select(
      "id, title, scenario, status, version, difficulty, industry_tags, answer_options ( id, content, author_position, option_signals ( id, competency_id, weight ) )",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as FullQuestion | null;
}

export async function listCompetencyRefs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("competencies")
    .select("id, slug, name")
    .eq("status", "published")
    .order("display_order");
  if (error) throw error;
  return data;
}

/** Guardrail input (§4.5): a question with recorded responses is immutable. */
export async function countResponsesForQuestion(questionId: string) {
  const admin = createAdminClient();
  const { count, error } = await admin
    .from("responses")
    .select("id", { count: "exact", head: true })
    .eq("question_id", questionId);
  if (error) throw error;
  return count ?? 0;
}

export async function countPublishedAssessmentsUsingQuestion(
  questionId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assessment_questions")
    .select("assessment_id, assessments!inner(status)")
    .eq("question_id", questionId)
    .eq("assessments.status", "published");
  if (error) throw error;
  return (data ?? []).length;
}

export async function insertQuestion(row: {
  title: string;
  scenario: string;
  difficulty: number;
  industry_tags: string[];
  created_by: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("questions")
    .insert(row as never)
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

export async function updateQuestion(
  id: string,
  row: {
    title: string;
    scenario: string;
    difficulty: number;
    industry_tags: string[];
    version?: number;
  },
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("questions")
    .update(row as never)
    .eq("id", id);
  if (error) throw error;
}

export async function setQuestionStatus(
  id: string,
  status: "draft" | "published" | "archived",
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("questions")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function upsertOption(row: {
  id?: string;
  question_id: string;
  content: string;
  author_position: number;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("answer_options")
    .upsert(row as never)
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteOptions(ids: string[]) {
  if (ids.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from("answer_options")
    .delete()
    .in("id", ids);
  if (error) throw error;
}

/** Replace an option's signals wholesale — simplest correct semantics. */
export async function replaceOptionSignals(
  optionId: string,
  signals: Array<{ competency_id: string; weight: number }>,
) {
  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from("option_signals")
    .delete()
    .eq("option_id", optionId);
  if (deleteError) throw deleteError;
  if (signals.length === 0) return;
  const { error } = await supabase
    .from("option_signals")
    .insert(signals.map((s) => ({ ...s, option_id: optionId })) as never);
  if (error) throw error;
}

// ---------- assessments (publish/unpublish — Decision 2) ----------

export async function listAssessments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assessments")
    .select("id, slug, title, status, question_count")
    .order("title");
  if (error) throw error;
  return data;
}

export async function countPublishedQuestionsInAssessment(
  assessmentId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assessment_questions")
    .select("question_id, questions!inner(status)")
    .eq("assessment_id", assessmentId)
    .eq("questions.status", "published");
  if (error) throw error;
  return (data ?? []).length;
}

export async function setAssessmentStatus(
  id: string,
  status: "draft" | "published",
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("assessments")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

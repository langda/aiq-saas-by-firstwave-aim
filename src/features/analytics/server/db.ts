import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Analytics data layer (Milestone 6). Uses the service client: events and
 * responses deliberately have no client-role read policies. Callers MUST be
 * authorized by the service first. JS-side aggregation is fine at current
 * volume; Phase-10-full swaps these for materialized views when it isn't.
 */

export async function getEventCounts() {
  const admin = createAdminClient();
  const { data, error } = await admin.from("events").select("type");
  if (error) throw error;
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.type, (counts.get(row.type) ?? 0) + 1);
  }
  return counts;
}

export async function getSessionStatusCounts() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("assessment_sessions")
    .select("status");
  if (error) throw error;
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.status, (counts.get(row.status) ?? 0) + 1);
  }
  return counts;
}

export async function getResultDistributions() {
  const admin = createAdminClient();
  const [results, personas] = await Promise.all([
    admin.from("results").select("persona_id, overall_score"),
    admin.from("personas").select("id, name"),
  ]);
  if (results.error) throw results.error;
  if (personas.error) throw personas.error;
  const personaName = new Map(personas.data.map((p) => [p.id, p.name]));
  return {
    rows: (results.data ?? []).map((r) => ({
      personaName: personaName.get(r.persona_id) ?? "—",
      overallScore: r.overall_score,
    })),
  };
}

export type QuestionStat = {
  questionId: string;
  title: string;
  options: Array<{ optionId: string; content: string; chosen: number }>;
  responses: number;
  averageTimeMs: number | null;
};

/** Answer distribution + timing per PUBLISHED question (item-quality data). */
export async function getQuestionStats(): Promise<QuestionStat[]> {
  const admin = createAdminClient();
  const [questions, responses] = await Promise.all([
    admin
      .from("questions")
      .select("id, title, answer_options ( id, content )")
      .eq("status", "published"),
    admin.from("responses").select("question_id, option_id, time_spent_ms"),
  ]);
  if (questions.error) throw questions.error;
  if (responses.error) throw responses.error;

  const byQuestion = new Map<
    string,
    { chosen: Map<string, number>; times: number[] }
  >();
  for (const r of responses.data ?? []) {
    let bucket = byQuestion.get(r.question_id);
    if (!bucket) {
      bucket = { chosen: new Map(), times: [] };
      byQuestion.set(r.question_id, bucket);
    }
    bucket.chosen.set(r.option_id, (bucket.chosen.get(r.option_id) ?? 0) + 1);
    if (r.time_spent_ms != null) bucket.times.push(r.time_spent_ms);
  }

  const rows = (questions.data ?? []) as unknown as Array<{
    id: string;
    title: string;
    answer_options: Array<{ id: string; content: string }>;
  }>;
  return rows.map((q) => {
    const bucket = byQuestion.get(q.id);
    const times = bucket?.times ?? [];
    return {
      questionId: q.id,
      title: q.title,
      options: q.answer_options.map((o) => ({
        optionId: o.id,
        content: o.content,
        chosen: bucket?.chosen.get(o.id) ?? 0,
      })),
      responses: [...(bucket?.chosen.values() ?? [])].reduce(
        (a, b) => a + b,
        0,
      ),
      averageTimeMs:
        times.length > 0
          ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
          : null,
    };
  });
}

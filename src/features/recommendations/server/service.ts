import "server-only";

import { z } from "zod";

import { generateRecommendations } from "@/lib/ai";
import { recommendationsSchema } from "@/lib/ai/schemas";

import { composeFallback } from "../fallback";
import * as db from "./db";

const competencyScoresSchema = z.record(z.string(), z.number().nullable());
const slugListSchema = z.array(z.string());
const confidenceSchema = z.object({ level: z.string() }).passthrough();

/**
 * Recommendation generation (ARCHITECTURE §12). Runs post-response, after
 * the result is persisted. Order of authority (ASSESSMENT_MODEL §6):
 * AI personalizes; the static library is the guaranteed floor. A total
 * failure of both marks the row failed — the UI keeps a graceful state.
 * Idempotent: an already-generated result is never overwritten.
 */
export async function generateForResult(resultId: string): Promise<void> {
  const status = await db.getStatus(resultId);
  if (status === "generated" || status === "reviewed") return;

  const summary = await db.getResultSummary(resultId);
  if (!summary) return;

  const scores = competencyScoresSchema.parse(summary.result.competency_scores);
  const strengths = slugListSchema.parse(summary.result.strengths);
  const blindSpots = slugListSchema.parse(summary.result.blind_spots);
  const nameOf = (slug: string) => summary.competencyNames.get(slug) ?? slug;

  // 1. AI path (Decision 10: OpenAI default; input is the profile summary only)
  try {
    const { recommendations, model, promptVersion } =
      await generateRecommendations({
        personaName: summary.persona?.name ?? "—",
        personaDescription: summary.persona?.description ?? "",
        overallScore: summary.result.overall_score,
        competencyScores: [...summary.competencyNames.entries()].map(
          ([slug, name]) => ({ name, score: scores[slug] ?? null }),
        ),
        strengths: strengths.map(nameOf),
        blindSpots: blindSpots.map(nameOf),
        confidenceLevel: confidenceSchema.parse(summary.result.confidence)
          .level,
      });
    await db.storeGenerated({
      resultId,
      content: recommendations,
      model,
      promptVersion,
    });
    return;
  } catch (error) {
    console.error("AI recommendation generation failed, using fallback", error);
  }

  // 2. Static fallback (mandatory floor — AI outage must be invisible)
  try {
    const templates = await db.getTemplates();
    const fallback = composeFallback({
      templates,
      blindSpots,
      competencyScores: scores,
    });
    if (fallback) {
      await db.storeGenerated({
        resultId,
        content: fallback,
        model: "static-fallback",
        promptVersion: null,
      });
      return;
    }
  } catch (error) {
    console.error("fallback recommendation composition failed", error);
  }

  await db.markFailed(resultId);
}

/** User-facing read for the results page — validated before rendering. */
export async function getRecommendationsForSession(sessionId: string) {
  const row = await db.getRecommendationForSession(sessionId);
  if (!row) return { status: "pending" as const, actions: null };
  if (row.status !== "generated" && row.status !== "reviewed")
    return { status: row.status, actions: null };
  const parsed = recommendationsSchema.safeParse(row.content);
  return parsed.success
    ? { status: row.status, actions: parsed.data.actions }
    : { status: "failed" as const, actions: null };
}

export { insertPending } from "./db";

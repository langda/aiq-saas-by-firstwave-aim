import "server-only";

import { randomUUID } from "node:crypto";

import { z } from "zod";

import { canTakeAssessment } from "@/core/authz";
import { parseScoringConfig } from "@/core/scoring/config";
import { score } from "@/core/scoring/engine";
import {
  orderOptions,
  selectQuestions,
  selectionStrategySchema,
} from "@/core/selection/strategy";
import type { AuthContext } from "@/core/types";

import type { ServedQuestions } from "../schemas";
import type { PublicQuestion, RunnerState } from "../types";
import * as db from "./db";
import { toPublicQuestion } from "./sanitize";

/**
 * Assessment orchestration (ARCHITECTURE §10). Anonymous-first: any
 * authenticated identity may run a session; results are gated elsewhere
 * (Decision 1). All scoring happens here, server-side, at submit.
 */

export class ServiceError extends Error {
  constructor(
    public readonly code: "not_found" | "forbidden" | "conflict",
    message: string,
  ) {
    super(message);
  }
}

const settingsSchema = z
  .object({ retakeCooldownDays: z.number().int().min(0).default(30) })
  .passthrough();

/** When the user may retake (Decision 7). null = now / never taken. */
export async function getRetakeAvailableAt(
  ctx: AuthContext,
  assessment: { id: string; settings: unknown },
): Promise<Date | null> {
  const { retakeCooldownDays } = settingsSchema.parse(
    assessment.settings ?? {},
  );
  if (retakeCooldownDays === 0) return null;
  const last = await db.getLatestCompletedSession(ctx.userId, assessment.id);
  if (!last?.completed_at) return null;
  const availableAt = new Date(last.completed_at);
  availableAt.setDate(availableAt.getDate() + retakeCooldownDays);
  return availableAt > new Date() ? availableAt : null;
}

/** Starts a session (or resumes the in-progress one). Returns the session id. */
export async function startSession(
  ctx: AuthContext,
  slug: string,
): Promise<{ sessionId: string; resumed: boolean }> {
  if (!canTakeAssessment(ctx))
    throw new ServiceError("forbidden", "Not allowed");

  const assessment = await db.getPublishedAssessment(slug);
  if (!assessment) throw new ServiceError("not_found", "Assessment not found");

  const existing = await db.getActiveSession(ctx.userId, assessment.id);
  if (existing) return { sessionId: existing.id, resumed: true };

  const retakeAt = await getRetakeAvailableAt(ctx, assessment);
  if (retakeAt)
    throw new ServiceError(
      "conflict",
      `Retake available on ${retakeAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
    );

  const seed = randomUUID();
  const strategy = selectionStrategySchema.parse(assessment.selection_strategy);
  const pool = await db.getAssessmentQuestionPool(assessment.id);
  const selectedIds = selectQuestions({
    strategy,
    pool: pool.map((q) => ({
      questionId: q.question_id,
      position: q.position,
    })),
    seed,
  });

  const questions = await db.getPublishedQuestionsWithOptions(selectedIds);
  if (questions.length === 0)
    throw new ServiceError("conflict", "Assessment has no published questions");

  // Snapshot exactly what this session serves: ids, versions, option order.
  const byId = new Map(questions.map((q) => [q.id, q]));
  const servedQuestions: ServedQuestions = selectedIds
    .filter((id) => byId.has(id))
    .map((id) => {
      const q = byId.get(id)!;
      return {
        questionId: q.id,
        version: q.version,
        optionIds: orderOptions(
          q.answer_options.map((o) => o.id),
          seed,
          q.id,
        ),
      };
    });

  const config = await db.getActiveScoringConfig();
  const session = await db.createSession({
    userId: ctx.userId,
    assessmentId: assessment.id,
    servedQuestions,
    seed,
    scoringConfigId: config.id,
  });

  await db.logEvent({
    type: "assessment_started",
    userId: ctx.userId,
    sessionId: session.id,
    payload: { assessment: slug },
  });

  return { sessionId: session.id, resumed: false };
}

/** Intro-screen gate: ISO date when retake unlocks, or null if free to start. */
export async function getRetakeGate(
  ctx: AuthContext,
  slug: string,
): Promise<string | null> {
  const assessment = await db.getPublishedAssessment(slug);
  if (!assessment) return null;
  const availableAt = await getRetakeAvailableAt(ctx, assessment);
  return availableAt ? availableAt.toISOString() : null;
}

/** Loads everything the runner needs, sanitized, in served order. */
export async function getRunnerState(
  ctx: AuthContext,
  slug: string,
): Promise<RunnerState | null> {
  const assessment = await db.getPublishedAssessment(slug);
  if (!assessment) throw new ServiceError("not_found", "Assessment not found");

  const session = await db.getActiveSession(ctx.userId, assessment.id);
  if (!session) return null;

  const served = db.parseServedQuestions(session.served_questions);
  const questions = await db.getPublishedQuestionsWithOptions(
    served.map((q) => q.questionId),
  );
  const byId = new Map(questions.map((q) => [q.id, q]));

  const publicQuestions: PublicQuestion[] = served.flatMap((sq) => {
    const q = byId.get(sq.questionId);
    if (!q) return [];
    return [
      toPublicQuestion({
        id: q.id,
        title: q.title,
        scenario: q.scenario,
        options: q.answer_options,
        orderedOptionIds: sq.optionIds,
      }),
    ];
  });

  const responses = await db.getSessionResponses(session.id);

  return {
    sessionId: session.id,
    assessmentTitle: assessment.title,
    questions: publicQuestions,
    answers: Object.fromEntries(
      responses.map((r) => [r.question_id, r.option_id]),
    ),
  };
}

export async function saveAnswer(
  ctx: AuthContext,
  input: {
    sessionId: string;
    questionId: string;
    optionId: string;
    timeSpentMs?: number;
  },
): Promise<void> {
  const session = await db.getSessionById(input.sessionId);
  if (!session || session.user_id !== ctx.userId)
    throw new ServiceError("not_found", "Session not found");
  if (session.status !== "in_progress")
    throw new ServiceError("conflict", "Session is not in progress");

  // Domain invariant: the option must belong to the question AS SERVED.
  const served = db.parseServedQuestions(session.served_questions);
  const question = served.find((q) => q.questionId === input.questionId);
  if (!question || !question.optionIds.includes(input.optionId))
    throw new ServiceError(
      "conflict",
      "Option does not belong to this question",
    );

  await db.upsertResponse(input);
}

/**
 * Submit: score server-side, persist, complete. Idempotent — a completed
 * session returns its existing result. Returns NO scores (Decision 1):
 * the caller redirects to the gated results page.
 */
export async function submitSession(
  ctx: AuthContext,
  sessionId: string,
): Promise<{ sessionId: string; claimToken: string | null }> {
  const session = await db.getSessionById(sessionId);
  if (!session || session.user_id !== ctx.userId)
    throw new ServiceError("not_found", "Session not found");

  if (session.status === "completed") {
    const existing = await db.getExistingResult(sessionId);
    if (existing) return { sessionId, claimToken: null };
  }
  if (session.status !== "in_progress")
    throw new ServiceError("conflict", "Session is not in progress");

  const served = db.parseServedQuestions(session.served_questions);
  const responses = await db.getSessionResponses(sessionId);
  if (responses.length < served.length)
    throw new ServiceError("conflict", "Not all questions are answered");

  const allOptionIds = served.flatMap((q) => q.optionIds);
  const signals = await db.getSignalsForOptions(allOptionIds);
  const configRow = await db.getScoringConfig(session.scoring_config_id);
  const config = parseScoringConfig(configRow.config);

  const outcome = score({
    responses: responses.map((r) => ({
      questionId: r.question_id,
      optionId: r.option_id,
    })),
    signals,
    servedQuestions: served.map((q) => ({
      questionId: q.questionId,
      optionIds: q.optionIds,
    })),
    config,
  });

  const personaIds = await db.getPersonaIdsBySlug(
    [outcome.primaryPersona, outcome.secondaryPersona].filter(
      (s): s is string => s !== null,
    ),
  );
  const personaId = personaIds.get(outcome.primaryPersona);
  if (!personaId)
    throw new ServiceError(
      "conflict",
      "Configured persona missing from database",
    );

  const claimToken = randomUUID();
  await db.persistResult({
    sessionId,
    userId: ctx.userId,
    overallScore: outcome.overallScore,
    competencyScores: outcome.competencyScores,
    personaId,
    secondaryPersonaId: outcome.secondaryPersona
      ? (personaIds.get(outcome.secondaryPersona) ?? null)
      : null,
    personaAffinities: outcome.affinities,
    strengths: outcome.strengths,
    blindSpots: outcome.blindSpots,
    confidence: outcome.confidence,
    scoringConfigId: session.scoring_config_id,
    // Reproducibility (§11.4): freeze the exact inputs that produced this result.
    scoringSnapshot: { configVersion: configRow.version, signals, served },
    claimToken,
  });

  await db.logEvent({
    type: "assessment_completed",
    userId: ctx.userId,
    sessionId,
  });

  // The claim token only matters for anonymous users (cross-account claiming).
  return { sessionId, claimToken: ctx.isAnonymous ? claimToken : null };
}

import "server-only";

import { canManageContent } from "@/core/authz";
import type { AuthContext } from "@/core/types";
import { auditLog } from "@/lib/audit";

import { validateForPublish, type AuthoringCheck } from "../authoring";
import type { QuestionUpsertInput } from "../schemas";
import * as db from "./db";

export class AuthoringError extends Error {
  constructor(
    public readonly code:
      "forbidden" | "not_found" | "conflict" | "invalid_input",
    message: string,
  ) {
    super(message);
  }
}

function assertAdmin(ctx: AuthContext) {
  if (!canManageContent(ctx))
    throw new AuthoringError("forbidden", "Not allowed");
}

/**
 * Create or update a question with its options and signals.
 * Guardrail (§4.5 / ASSESSMENT_MODEL version discipline): a question with
 * recorded responses is immutable — archive it and author a replacement.
 * Editing a published question without responses bumps its version.
 */
export async function saveQuestion(
  ctx: AuthContext,
  input: QuestionUpsertInput,
): Promise<{ id: string }> {
  assertAdmin(ctx);

  const competencies = await db.listCompetencyRefs();
  const competencyIdBySlug = new Map(competencies.map((c) => [c.slug, c.id]));
  for (const option of input.options) {
    for (const signal of option.signals) {
      if (!competencyIdBySlug.has(signal.competencySlug))
        throw new AuthoringError(
          "invalid_input",
          `Unknown competency: ${signal.competencySlug}`,
        );
    }
  }

  let questionId = input.id;
  let existing: Awaited<ReturnType<typeof db.getFullQuestion>> = null;

  if (questionId) {
    existing = await db.getFullQuestion(questionId);
    if (!existing) throw new AuthoringError("not_found", "Question not found");

    const responseCount = await db.countResponsesForQuestion(questionId);
    if (responseCount > 0)
      throw new AuthoringError(
        "conflict",
        `This question has ${responseCount} recorded responses and cannot be edited — archive it and create a replacement (result reproducibility).`,
      );

    await db.updateQuestion(questionId, {
      title: input.title,
      scenario: input.scenario,
      difficulty: input.difficulty,
      industry_tags: input.industryTags,
      // Content edit of a published question is a new version.
      ...(existing.status === "published"
        ? { version: existing.version + 1 }
        : {}),
    });
  } else {
    const created = await db.insertQuestion({
      title: input.title,
      scenario: input.scenario,
      difficulty: input.difficulty,
      industry_tags: input.industryTags,
      created_by: ctx.userId,
    });
    questionId = created.id;
  }

  // Reconcile options: upsert incoming, delete removed, replace signals.
  const incomingIds = new Set(
    input.options.map((o) => o.id).filter((id): id is string => !!id),
  );
  const removed = (existing?.answer_options ?? [])
    .map((o) => o.id)
    .filter((id) => !incomingIds.has(id));
  await db.deleteOptions(removed);

  for (const [position, option] of input.options.entries()) {
    const saved = await db.upsertOption({
      ...(option.id ? { id: option.id } : {}),
      question_id: questionId,
      content: option.content,
      author_position: position + 1,
    });
    await db.replaceOptionSignals(
      saved.id,
      option.signals.map((s) => ({
        competency_id: competencyIdBySlug.get(s.competencySlug)!,
        weight: s.weight,
      })),
    );
  }

  await auditLog(ctx, {
    action: input.id ? "question.update" : "question.create",
    entityType: "question",
    entityId: questionId,
    diff: { title: input.title, options: input.options.length },
  });

  return { id: questionId };
}

/** Publish gate: ASSESSMENT_MODEL rules must pass (validated server-side). */
export async function publishQuestion(
  ctx: AuthContext,
  id: string,
): Promise<AuthoringCheck> {
  assertAdmin(ctx);
  const question = await db.getFullQuestion(id);
  if (!question) throw new AuthoringError("not_found", "Question not found");

  const competencies = await db.listCompetencyRefs();
  const slugById = new Map(competencies.map((c) => [c.id, c.slug]));
  const check = validateForPublish(
    question.answer_options
      .sort((a, b) => a.author_position - b.author_position)
      .map((o) => ({
        content: o.content,
        signals: o.option_signals.map((s) => ({
          competencySlug: slugById.get(s.competency_id) ?? "unknown",
          weight: Number(s.weight),
        })),
      })),
    competencies.map((c) => c.slug),
  );
  if (check.errors.length > 0) return check;

  await db.setQuestionStatus(id, "published");
  await auditLog(ctx, {
    action: "question.publish",
    entityType: "question",
    entityId: id,
    diff: { warnings: check.warnings },
  });
  return check;
}

export async function retireQuestion(
  ctx: AuthContext,
  id: string,
  target: "draft" | "archived",
): Promise<void> {
  assertAdmin(ctx);
  const inPublishedAssessments =
    await db.countPublishedAssessmentsUsingQuestion(id);
  if (inPublishedAssessments > 0)
    throw new AuthoringError(
      "conflict",
      "Question is part of a published assessment — unpublish the assessment first.",
    );
  await db.setQuestionStatus(id, target);
  await auditLog(ctx, {
    action: target === "archived" ? "question.archive" : "question.unpublish",
    entityType: "question",
    entityId: id,
  });
}

// ---------- assessment publish/unpublish (Decision 2) ----------

export async function setAssessmentPublished(
  ctx: AuthContext,
  id: string,
  publish: boolean,
): Promise<void> {
  assertAdmin(ctx);
  if (publish) {
    const assessments = await db.listAssessments();
    const assessment = assessments.find((a) => a.id === id);
    if (!assessment)
      throw new AuthoringError("not_found", "Assessment not found");
    const available = await db.countPublishedQuestionsInAssessment(id);
    if (available < assessment.question_count)
      throw new AuthoringError(
        "conflict",
        `Assessment needs ${assessment.question_count} published questions, has ${available}.`,
      );
  }
  await db.setAssessmentStatus(id, publish ? "published" : "draft");
  await auditLog(ctx, {
    action: publish ? "assessment.publish" : "assessment.unpublish",
    entityType: "assessment",
    entityId: id,
  });
}

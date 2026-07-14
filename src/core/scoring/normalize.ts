import type { ResponseInput, ServedQuestionInput, SignalInput } from "./types";

/**
 * Per-session competency normalization (ARCHITECTURE §11.1):
 *
 *   earned_c = Σ signal weight of chosen options toward c
 *   max_c    = Σ over served questions of max(option signal weight toward c)
 *   score_c  = max_c > 0 ? round(100 × earned_c / max_c) : null
 *
 * Normalizing each session against its own maximum makes scores comparable
 * across assessment lengths (Decision 8). null = "not measured", never zero.
 */
export function computeCompetencyScores(input: {
  responses: ResponseInput[];
  signals: SignalInput[];
  servedQuestions: ServedQuestionInput[];
  competencies: string[];
}): Record<string, number | null> {
  const { responses, signals, servedQuestions, competencies } = input;

  // option → competency → summed weight (an option may emit several signals
  // toward the same competency; they aggregate).
  const optionWeights = new Map<string, Map<string, number>>();
  for (const s of signals) {
    let byCompetency = optionWeights.get(s.optionId);
    if (!byCompetency) {
      byCompetency = new Map();
      optionWeights.set(s.optionId, byCompetency);
    }
    byCompetency.set(
      s.competencySlug,
      (byCompetency.get(s.competencySlug) ?? 0) + s.weight,
    );
  }

  const chosenByQuestion = new Map(
    responses.map((r) => [r.questionId, r.optionId]),
  );

  const earned = new Map<string, number>();
  const max = new Map<string, number>();

  for (const question of servedQuestions) {
    // max_c: the strongest signal this question could have emitted toward c.
    const questionMax = new Map<string, number>();
    for (const optionId of question.optionIds) {
      const byCompetency = optionWeights.get(optionId);
      if (!byCompetency) continue;
      for (const [slug, weight] of byCompetency) {
        questionMax.set(slug, Math.max(questionMax.get(slug) ?? 0, weight));
      }
    }
    for (const [slug, weight] of questionMax) {
      max.set(slug, (max.get(slug) ?? 0) + weight);
    }

    const chosen = chosenByQuestion.get(question.questionId);
    if (!chosen) continue; // unanswered — contributes to max only
    const chosenWeights = optionWeights.get(chosen);
    if (!chosenWeights) continue;
    for (const [slug, weight] of chosenWeights) {
      earned.set(slug, (earned.get(slug) ?? 0) + weight);
    }
  }

  const scores: Record<string, number | null> = {};
  for (const slug of competencies) {
    const maxWeight = max.get(slug) ?? 0;
    scores[slug] =
      maxWeight > 0
        ? Math.round((100 * (earned.get(slug) ?? 0)) / maxWeight)
        : null;
  }
  return scores;
}

/** Overall = weighted mean of measured competency scores (weights from config). */
export function computeOverallScore(
  competencyScores: Record<string, number | null>,
  competencyWeights: Record<string, number>,
): number {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const [slug, score] of Object.entries(competencyScores)) {
    if (score === null) continue;
    const weight = competencyWeights[slug] ?? 1;
    weightedSum += score * weight;
    totalWeight += weight;
  }
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

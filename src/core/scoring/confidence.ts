import type { ScoringConfig } from "./config";
import type {
  ConfidenceLevel,
  ResponseInput,
  ServedQuestionInput,
  SignalInput,
} from "./types";

/**
 * Confidence in the assessment profile itself (Decision 5) — never anything
 * about AI. Weighted sum of three 0..1 components:
 *
 * - volume:      collected signals / target (saturates at 1)
 * - coverage:    competencies with >= K signals / all competencies
 * - consistency: 1 − mean dispersion of a competency's per-question
 *                contribution ratios (contradictory picks lower it);
 *                neutral 0.5 when no competency is measured twice
 */
export function computeConfidence(input: {
  responses: ResponseInput[];
  signals: SignalInput[];
  servedQuestions: ServedQuestionInput[];
  competencies: string[];
  config: ScoringConfig["confidence"];
}): {
  value: number;
  level: ConfidenceLevel;
  components: { volume: number; consistency: number; coverage: number };
} {
  const { responses, signals, servedQuestions, competencies, config } = input;

  const optionSignals = new Map<string, SignalInput[]>();
  for (const s of signals) {
    const list = optionSignals.get(s.optionId) ?? [];
    list.push(s);
    optionSignals.set(s.optionId, list);
  }
  const questionByOption = new Map<string, string>();
  for (const q of servedQuestions) {
    for (const optionId of q.optionIds)
      questionByOption.set(optionId, q.questionId);
  }

  // --- volume ---
  const chosenSignals = responses.flatMap(
    (r) => optionSignals.get(r.optionId) ?? [],
  );
  const volume = Math.min(1, chosenSignals.length / config.targetSignalVolume);

  // --- coverage ---
  const signalCount = new Map<string, number>();
  for (const s of chosenSignals) {
    signalCount.set(
      s.competencySlug,
      (signalCount.get(s.competencySlug) ?? 0) + 1,
    );
  }
  const covered = competencies.filter(
    (c) => (signalCount.get(c) ?? 0) >= config.minSignalsPerCompetency,
  ).length;
  const coverage = competencies.length > 0 ? covered / competencies.length : 0;

  // --- consistency ---
  // Per competency: each measuring question contributes ratio = chosen weight /
  // question max weight toward that competency. Dispersion of those ratios
  // (mean absolute deviation, scaled) measures contradiction.
  const ratiosByCompetency = new Map<string, number[]>();
  for (const q of servedQuestions) {
    const chosen = responses.find(
      (r) => r.questionId === q.questionId,
    )?.optionId;
    if (!chosen) continue;
    const questionMax = new Map<string, number>();
    for (const optionId of q.optionIds) {
      for (const s of optionSignals.get(optionId) ?? []) {
        questionMax.set(
          s.competencySlug,
          Math.max(questionMax.get(s.competencySlug) ?? 0, s.weight),
        );
      }
    }
    const chosenWeights = new Map<string, number>();
    for (const s of optionSignals.get(chosen) ?? []) {
      chosenWeights.set(
        s.competencySlug,
        (chosenWeights.get(s.competencySlug) ?? 0) + s.weight,
      );
    }
    for (const [slug, maxWeight] of questionMax) {
      if (maxWeight <= 0) continue;
      const ratio = Math.min(1, (chosenWeights.get(slug) ?? 0) / maxWeight);
      const list = ratiosByCompetency.get(slug) ?? [];
      list.push(ratio);
      ratiosByCompetency.set(slug, list);
    }
  }
  const dispersions: number[] = [];
  for (const ratios of ratiosByCompetency.values()) {
    if (ratios.length < 2) continue;
    const mean = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    const mad =
      ratios.reduce((a, b) => a + Math.abs(b - mean), 0) / ratios.length;
    dispersions.push(Math.min(1, mad * 2)); // MAD of 0..1 ratios maxes near 0.5
  }
  const consistency =
    dispersions.length > 0
      ? 1 - dispersions.reduce((a, b) => a + b, 0) / dispersions.length
      : 0.5;

  // --- weighted sum ---
  const { weights } = config;
  const totalWeight = weights.volume + weights.consistency + weights.coverage;
  const value =
    totalWeight > 0
      ? (volume * weights.volume +
          consistency * weights.consistency +
          coverage * weights.coverage) /
        totalWeight
      : 0;

  const level: ConfidenceLevel =
    value >= config.levels.high
      ? "high"
      : value >= config.levels.moderate
        ? "moderate"
        : "low";

  return {
    value: Math.round(value * 1000) / 1000,
    level,
    components: {
      volume: Math.round(volume * 1000) / 1000,
      consistency: Math.round(consistency * 1000) / 1000,
      coverage: Math.round(coverage * 1000) / 1000,
    },
  };
}

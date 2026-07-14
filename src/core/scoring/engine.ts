import type { ScoringConfig } from "./config";
import { computeConfidence } from "./confidence";
import { computeCompetencyScores, computeOverallScore } from "./normalize";
import { computePersonaAssignment } from "./persona";
import type {
  ResponseInput,
  ScoringOutcome,
  ServedQuestionInput,
  SignalInput,
} from "./types";

/**
 * The scoring engine (ARCHITECTURE §11): behavioral signals → competencies →
 * personas, per Decision 4's hierarchy. Pure and deterministic — no I/O, no
 * randomness, no product-specific knowledge (Decision 16). The caller loads
 * responses/signals/config from persistence and stores the outcome.
 */
export function score(input: {
  responses: ResponseInput[];
  signals: SignalInput[];
  servedQuestions: ServedQuestionInput[];
  config: ScoringConfig;
}): ScoringOutcome {
  const { responses, signals, servedQuestions, config } = input;

  const competencyScores = computeCompetencyScores({
    responses,
    signals,
    servedQuestions,
    competencies: config.competencies,
  });

  const overallScore = computeOverallScore(
    competencyScores,
    config.overall.competencyWeights,
  );

  const { primaryPersona, secondaryPersona, affinities } =
    computePersonaAssignment({
      competencyScores,
      overallScore,
      config: config.personas,
      competencies: config.competencies,
    });

  const measured = Object.entries(competencyScores)
    .filter((e): e is [string, number] => e[1] !== null)
    .sort((a, b) => b[1] - a[1]);

  const strengths = measured
    .filter(([, s]) => s >= config.strengths.minScore)
    .slice(0, config.strengths.count)
    .map(([slug]) => slug);

  const blindSpots = measured
    .filter(([, s]) => s <= config.blindSpots.maxScore)
    .slice(-config.blindSpots.count)
    .reverse()
    .map(([slug]) => slug);

  const confidence = computeConfidence({
    responses,
    signals,
    servedQuestions,
    competencies: config.competencies,
    config: config.confidence,
  });

  return {
    competencyScores,
    overallScore,
    primaryPersona,
    secondaryPersona,
    affinities,
    strengths,
    blindSpots,
    confidence,
  };
}

import { z } from "zod";

/**
 * Scoring configuration schema — the runtime shape of scoring_configs.config.
 * Everything tunable lives here, keyed by slugs (Decision 16: the engine is
 * product-agnostic; AIQ's competencies and personas are data, not code).
 * JSONB is untyped until this schema says otherwise — always parse, never cast.
 */
export const scoringConfigSchema = z.object({
  version: z.number().int().positive(),
  /** Competency slugs this config measures. Defines coverage denominators. */
  competencies: z.array(z.string().min(1)).min(1),
  overall: z.object({
    /** slug → weight in the overall mean. Missing slugs default to 1. */
    competencyWeights: z
      .record(z.string(), z.number().nonnegative())
      .default({}),
  }),
  strengths: z.object({
    count: z.number().int().positive(),
    minScore: z.number().min(0).max(100),
  }),
  blindSpots: z.object({
    count: z.number().int().positive(),
    maxScore: z.number().min(0).max(100),
  }),
  personas: z.object({
    signatures: z
      .array(
        z.object({
          persona: z.string().min(1),
          /** slug → 0..1 signature weight. Omitted slugs use `baseline`. */
          profile: z.record(z.string(), z.number().min(0).max(1)),
          gates: z
            .object({ overallGte: z.number().min(0).max(100).optional() })
            .optional(),
        }),
      )
      .min(1),
    /** Baseline signature value for competencies omitted from a profile. */
    baseline: z.number().min(0).max(1).default(0.2),
    secondary: z.object({
      minAffinity: z.number().min(0).max(1),
      display: z.boolean(),
    }),
    /** Assigned when no signature passes its gates. Must exist in signatures. */
    fallback: z.string().min(1),
  }),
  confidence: z.object({
    weights: z.object({
      volume: z.number().nonnegative(),
      consistency: z.number().nonnegative(),
      coverage: z.number().nonnegative(),
    }),
    /** A competency counts as covered at >= this many signals. */
    minSignalsPerCompetency: z.number().int().positive(),
    /** Signal count at which the volume component saturates to 1. */
    targetSignalVolume: z.number().int().positive(),
    /** Level thresholds on the 0..1 confidence value. */
    levels: z.object({
      high: z.number().min(0).max(1),
      moderate: z.number().min(0).max(1),
    }),
  }),
});

export type ScoringConfig = z.infer<typeof scoringConfigSchema>;

export function parseScoringConfig(raw: unknown): ScoringConfig {
  return scoringConfigSchema.parse(raw);
}

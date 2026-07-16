import { z } from "zod";

/**
 * Structured output contract for recommendation generation (ARCHITECTURE §12):
 * the model returns JSON matching this schema or the output is discarded —
 * no free-text rendering of unvalidated model output, ever.
 */
export const recommendedActionSchema = z.object({
  title: z.string().min(3).max(140),
  why: z.string().min(10).max(500),
  how: z.string().min(10).max(500),
});

export const recommendationsSchema = z.object({
  actions: z.array(recommendedActionSchema).length(3),
});

export type RecommendedAction = z.infer<typeof recommendedActionSchema>;
export type Recommendations = z.infer<typeof recommendationsSchema>;

/** Profile summary the AI receives — NEVER raw responses or signal weights. */
export type RecommendationInput = {
  personaName: string;
  personaDescription: string;
  overallScore: number;
  competencyScores: Array<{ name: string; score: number | null }>;
  strengths: string[];
  blindSpots: string[];
  confidenceLevel: string;
};

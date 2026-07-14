/** Inputs and outputs of the scoring engine — transport-agnostic, product-agnostic. */

/** One behavioral signal: choosing `optionId` evidences `competencySlug`. */
export type SignalInput = {
  optionId: string;
  competencySlug: string;
  traitSlug?: string | null;
  weight: number;
};

/** A question as served to a session, with every option it offered. */
export type ServedQuestionInput = {
  questionId: string;
  optionIds: string[];
};

export type ResponseInput = {
  questionId: string;
  optionId: string;
};

export type ConfidenceLevel = "high" | "moderate" | "low";

export type PersonaAffinity = {
  persona: string;
  affinity: number;
  passedGates: boolean;
};

export type ScoringOutcome = {
  /** slug → 0..100, or null when the served set never measured it. */
  competencyScores: Record<string, number | null>;
  overallScore: number;
  primaryPersona: string;
  secondaryPersona: string | null;
  affinities: PersonaAffinity[];
  strengths: string[];
  blindSpots: string[];
  confidence: {
    value: number;
    level: ConfidenceLevel;
    components: { volume: number; consistency: number; coverage: number };
  };
};

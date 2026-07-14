import { describe, expect, it } from "vitest";

import { parseScoringConfig, type ScoringConfig } from "./config";
import { score } from "./engine";
import { computeCompetencyScores, computeOverallScore } from "./normalize";
import { computePersonaAssignment } from "./persona";
import type { ServedQuestionInput, SignalInput } from "./types";

/**
 * Test fixture: a product-agnostic two-persona config over three
 * competencies (the engine must not care that AIQ has eight — Decision 16).
 */
function makeConfig(overrides?: Partial<ScoringConfig>): ScoringConfig {
  return parseScoringConfig({
    version: 1,
    competencies: ["alpha", "beta", "gamma"],
    overall: { competencyWeights: {} },
    strengths: { count: 2, minScore: 60 },
    blindSpots: { count: 2, maxScore: 40 },
    personas: {
      signatures: [
        { persona: "shaper", profile: { alpha: 1.0, beta: 0.3 } },
        {
          persona: "strategist",
          profile: { gamma: 1.0, beta: 0.8 },
          gates: { overallGte: 60 },
        },
      ],
      baseline: 0.2,
      secondary: { minAffinity: 0.55, display: false },
      fallback: "shaper",
    },
    confidence: {
      weights: { volume: 1, consistency: 1, coverage: 1 },
      minSignalsPerCompetency: 2,
      targetSignalVolume: 12,
      levels: { high: 0.75, moderate: 0.5 },
    },
    ...overrides,
  });
}

// Two questions, two options each. q1 measures alpha strongly / beta weakly;
// q2 measures alpha weakly / gamma strongly. Nothing measures... beta only via
// q1's o2, gamma via q2's o2.
const signals: SignalInput[] = [
  { optionId: "q1o1", competencySlug: "alpha", weight: 2 },
  { optionId: "q1o2", competencySlug: "beta", weight: 2 },
  { optionId: "q1o2", competencySlug: "alpha", weight: 1 },
  { optionId: "q2o1", competencySlug: "alpha", weight: 1 },
  { optionId: "q2o2", competencySlug: "gamma", weight: 3 },
];
const served: ServedQuestionInput[] = [
  { questionId: "q1", optionIds: ["q1o1", "q1o2"] },
  { questionId: "q2", optionIds: ["q2o1", "q2o2"] },
];

describe("computeCompetencyScores (normalization §11.1)", () => {
  it("normalizes earned against per-session max", () => {
    // Chooses q1o1 (alpha+2) and q2o1 (alpha+1):
    // alpha: earned 3, max = 2 (q1 best) + 1 (q2 best) = 3 → 100
    // beta:  earned 0, max 2 → 0 ; gamma: earned 0, max 3 → 0
    const scores = computeCompetencyScores({
      responses: [
        { questionId: "q1", optionId: "q1o1" },
        { questionId: "q2", optionId: "q2o1" },
      ],
      signals,
      servedQuestions: served,
      competencies: ["alpha", "beta", "gamma"],
    });
    expect(scores).toEqual({ alpha: 100, beta: 0, gamma: 0 });
  });

  it("returns null (not zero) for competencies the served set never measured", () => {
    const scores = computeCompetencyScores({
      responses: [{ questionId: "q1", optionId: "q1o1" }],
      signals,
      servedQuestions: [served[0]],
      competencies: ["alpha", "beta", "gamma", "delta"],
    });
    expect(scores.delta).toBeNull();
    expect(scores.gamma).toBeNull(); // q2 not served
    expect(scores.alpha).toBe(100);
  });

  it("unanswered questions raise the max but earn nothing", () => {
    const scores = computeCompetencyScores({
      responses: [{ questionId: "q1", optionId: "q1o1" }],
      signals,
      servedQuestions: served, // q2 served but unanswered
      competencies: ["alpha"],
    });
    expect(scores.alpha).toBe(Math.round((100 * 2) / 3)); // 2 earned of 3 possible
  });

  it("aggregates multiple signals from one option toward one competency", () => {
    const scores = computeCompetencyScores({
      responses: [{ questionId: "q", optionId: "o1" }],
      signals: [
        { optionId: "o1", competencySlug: "alpha", weight: 1 },
        { optionId: "o1", competencySlug: "alpha", weight: 1 },
        { optionId: "o2", competencySlug: "alpha", weight: 3 },
      ],
      servedQuestions: [{ questionId: "q", optionIds: ["o1", "o2"] }],
      competencies: ["alpha"],
    });
    expect(scores.alpha).toBe(67); // 2 of 3
  });
});

describe("computeOverallScore", () => {
  it("takes an equal-weight mean by default and skips unmeasured", () => {
    expect(computeOverallScore({ a: 80, b: 40, c: null }, {})).toBe(60);
  });
  it("applies configured weights", () => {
    expect(computeOverallScore({ a: 100, b: 0 }, { a: 3, b: 1 })).toBe(75);
  });
  it("returns 0 when nothing was measured", () => {
    expect(computeOverallScore({ a: null }, {})).toBe(0);
  });
});

describe("computePersonaAssignment (§11.2 affinity model)", () => {
  const personas = makeConfig().personas;

  it("assigns the persona whose signature shape matches the profile", () => {
    const alphaHeavy = computePersonaAssignment({
      competencyScores: { alpha: 95, beta: 30, gamma: 20 },
      overallScore: 48,
      config: personas,
      competencies: ["alpha", "beta", "gamma"],
    });
    expect(alphaHeavy.primaryPersona).toBe("shaper");

    const gammaHeavy = computePersonaAssignment({
      competencyScores: { alpha: 20, beta: 70, gamma: 95 },
      overallScore: 62,
      config: personas,
      competencies: ["alpha", "beta", "gamma"],
    });
    expect(gammaHeavy.primaryPersona).toBe("strategist");
  });

  it("shape decides, not magnitude: same shape at low scores → same persona", () => {
    const high = computePersonaAssignment({
      competencyScores: { alpha: 90, beta: 27, gamma: 18 },
      overallScore: 45,
      config: personas,
      competencies: ["alpha", "beta", "gamma"],
    });
    const low = computePersonaAssignment({
      competencyScores: { alpha: 30, beta: 9, gamma: 6 },
      overallScore: 15,
      config: personas,
      competencies: ["alpha", "beta", "gamma"],
    });
    expect(high.primaryPersona).toBe(low.primaryPersona);
  });

  it("enforces gates: a strategist shape below the overall gate falls through", () => {
    const gated = computePersonaAssignment({
      competencyScores: { alpha: 10, beta: 40, gamma: 50 },
      overallScore: 33, // < 60 gate
      config: personas,
      competencies: ["alpha", "beta", "gamma"],
    });
    expect(gated.primaryPersona).toBe("shaper");
    expect(
      gated.affinities.find((a) => a.persona === "strategist")?.passedGates,
    ).toBe(false);
  });

  it("falls back when no signature passes gates", () => {
    const allGated = computePersonaAssignment({
      competencyScores: { alpha: 50 },
      overallScore: 10,
      config: {
        ...personas,
        signatures: [
          {
            persona: "strategist",
            profile: { alpha: 1 },
            gates: { overallGte: 90 },
          },
        ],
        fallback: "shaper",
      },
      competencies: ["alpha"],
    });
    expect(allGated.primaryPersona).toBe("shaper");
  });

  it("reports a secondary persona only above the affinity floor", () => {
    const result = computePersonaAssignment({
      competencyScores: { alpha: 80, beta: 75, gamma: 70 },
      overallScore: 75,
      config: personas,
      competencies: ["alpha", "beta", "gamma"],
    });
    expect(result.secondaryPersona).not.toBeNull();
    expect(result.secondaryPersona).not.toBe(result.primaryPersona);

    const lonely = computePersonaAssignment({
      competencyScores: { alpha: 80, beta: 75, gamma: 70 },
      overallScore: 75,
      config: {
        ...personas,
        secondary: { minAffinity: 0.999, display: false },
      },
      competencies: ["alpha", "beta", "gamma"],
    });
    expect(lonely.secondaryPersona).toBeNull();
  });
});

describe("score (full engine)", () => {
  const config = makeConfig();

  it("produces a complete, internally consistent outcome", () => {
    const outcome = score({
      responses: [
        { questionId: "q1", optionId: "q1o1" },
        { questionId: "q2", optionId: "q2o2" },
      ],
      signals,
      servedQuestions: served,
      config,
    });
    expect(outcome.competencyScores).toEqual({
      alpha: 67,
      beta: 0,
      gamma: 100,
    });
    expect(outcome.overallScore).toBe(56);
    expect(outcome.primaryPersona).toBeTruthy();
    expect(outcome.affinities).toHaveLength(2);
    expect(outcome.strengths).toContain("gamma");
    expect(outcome.blindSpots).toContain("beta");
    expect(outcome.confidence.level).toMatch(/high|moderate|low/);
  });

  it("is deterministic", () => {
    const input = {
      responses: [{ questionId: "q1", optionId: "q1o2" }],
      signals,
      servedQuestions: served,
      config,
    };
    expect(score(input)).toEqual(score(input));
  });

  it("strengths respect the min-score floor", () => {
    const outcome = score({
      responses: [{ questionId: "q1", optionId: "q1o2" }], // beta 100, alpha 33
      signals,
      servedQuestions: [served[0]],
      config,
    });
    expect(outcome.strengths).toEqual(["beta"]);
    expect(outcome.strengths).not.toContain("alpha"); // 33 < minScore 60
  });

  it("a fuller, consistent session raises confidence", () => {
    const sparse = score({
      responses: [{ questionId: "q1", optionId: "q1o1" }],
      signals,
      servedQuestions: [served[0]],
      config,
    });
    // q1o1 + q2o1 both signal alpha — consistent behavior, more volume/coverage.
    const fuller = score({
      responses: [
        { questionId: "q1", optionId: "q1o1" },
        { questionId: "q2", optionId: "q2o1" },
      ],
      signals,
      servedQuestions: served,
      config,
    });
    expect(fuller.confidence.value).toBeGreaterThan(sparse.confidence.value);
  });

  it("contradictory responses lower the consistency component (Decision 5)", () => {
    // Strong alpha on q1, then rejecting alpha on q2 → dispersion on alpha.
    const contradictory = score({
      responses: [
        { questionId: "q1", optionId: "q1o1" },
        { questionId: "q2", optionId: "q2o2" },
      ],
      signals,
      servedQuestions: served,
      config,
    });
    const consistent = score({
      responses: [
        { questionId: "q1", optionId: "q1o1" },
        { questionId: "q2", optionId: "q2o1" },
      ],
      signals,
      servedQuestions: served,
      config,
    });
    expect(contradictory.confidence.components.consistency).toBeLessThan(
      consistent.confidence.components.consistency,
    );
  });

  it("an 8-question session cannot reach high confidence (honest by design)", () => {
    // ASSESSMENT_MODEL §8: with ~2 signals/question against a target of 30+,
    // the free assessment caps below the high threshold.
    const realConfig = makeConfig({
      confidence: {
        weights: { volume: 1, consistency: 1, coverage: 1 },
        minSignalsPerCompetency: 3,
        targetSignalVolume: 40,
        levels: { high: 0.75, moderate: 0.4 },
      },
    });
    const outcome = score({
      responses: [
        { questionId: "q1", optionId: "q1o1" },
        { questionId: "q2", optionId: "q2o2" },
      ],
      signals,
      servedQuestions: served,
      config: realConfig,
    });
    expect(outcome.confidence.level).not.toBe("high");
  });
});

describe("parseScoringConfig", () => {
  it("rejects malformed config instead of casting", () => {
    expect(() => parseScoringConfig({ version: 1 })).toThrow();
    expect(() =>
      parseScoringConfig({
        ...makeConfig(),
        strengths: { count: 0, minScore: 60 },
      }),
    ).toThrow();
  });
});

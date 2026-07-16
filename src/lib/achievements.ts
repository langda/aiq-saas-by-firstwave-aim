/**
 * Achievement levels (UX_PHILOSOPHY: achievements over analytics).
 * Display-only mapping of the overall score — the scoring engine is
 * untouched. Minimum two stars: a one-star achievement violates the
 * No Shame Rule. Admin-editable via CMS in Phase 7; config-in-code v1.
 */

export type AchievementLevel = {
  name: string;
  /** Filled stars out of 5. */
  stars: number;
  /** Apex only: fifth star gets the glow treatment. */
  glow: boolean;
  /** Short encouraging descriptor (used on share surfaces sparingly). */
  feel: string;
};

const LEVELS: Array<{ minScore: number } & AchievementLevel> = [
  { minScore: 85, name: "Apex", stars: 5, glow: true, feel: "Rare air" },
  {
    minScore: 65,
    name: "Surge",
    stars: 5,
    glow: false,
    feel: "Operating at force",
  },
  { minScore: 45, name: "Flow", stars: 4, glow: false, feel: "In stride" },
  {
    minScore: 25,
    name: "Rising",
    stars: 3,
    glow: false,
    feel: "Momentum building",
  },
  {
    minScore: 0,
    name: "Spark",
    stars: 2,
    glow: false,
    feel: "Every mastery starts here",
  },
];

export function getAchievement(overallScore: number): AchievementLevel {
  const level =
    LEVELS.find((l) => overallScore >= l.minScore) ?? LEVELS[LEVELS.length - 1];
  return {
    name: level.name,
    stars: level.stars,
    glow: level.glow,
    feel: level.feel,
  };
}

import "server-only";

import type { RecommendationInput } from "../schemas";

/**
 * Versioned prompt (PROJECT_RULES: prompts centralized; version recorded on
 * every generation). Voice rules from ASSESSMENT_MODEL §6: strengths-first,
 * no remediation language, actions doable within a week without purchases.
 */
export const PROMPT_VERSION = "recommendations.v1";

export const SYSTEM_PROMPT = `You are AIQ's coaching engine. AIQ is a behavioral assessment of how people apply AI in real work — there are no right answers and no grades, only work-style profiles.

Write exactly 3 recommended actions for the person described. Rules:
- Strengths-first framing: aim their strengths at their blind spots. Never use remediation language ("you failed", "you lack", "improve your weakness").
- Each action must be concrete and doable within one week at work, without buying anything.
- "why" ties the action to THEIR specific profile (mention their persona or scores naturally).
- "how" is a specific first step, not generic advice.
- Plain workplace language. No AI jargon, no buzzwords, no exclamation marks.

Respond with JSON only, exactly this shape:
{"actions":[{"title":"...","why":"...","how":"..."},{"title":"...","why":"...","how":"..."},{"title":"...","why":"...","how":"..."}]}`;

export function buildUserPrompt(input: RecommendationInput): string {
  const scores = input.competencyScores
    .map((c) => `${c.name}: ${c.score === null ? "not measured" : c.score}`)
    .join(", ");
  return [
    `Persona: ${input.personaName} — ${input.personaDescription}`,
    `Overall score: ${input.overallScore}/100 (profile confidence: ${input.confidenceLevel})`,
    `Competency scores (0–100): ${scores}`,
    `Strengths: ${input.strengths.join(", ") || "none above threshold"}`,
    `Blind spots: ${input.blindSpots.join(", ") || "none below threshold"}`,
  ].join("\n");
}

import "server-only";

import {
  PROMPT_VERSION,
  SYSTEM_PROMPT,
  buildUserPrompt,
} from "./prompts/recommendations.v1";
import { completeJson, getModelName } from "./providers/openai";
import {
  recommendationsSchema,
  type RecommendationInput,
  type Recommendations,
} from "./schemas";

/**
 * The AI adapter (ARCHITECTURE §12). Callers use this interface only —
 * swapping OpenAI for Anthropic is a new file in providers/ plus one import.
 * AI generates recommendations, never scores (Decision 4/AI Rules), and its
 * input is the profile summary — never raw responses or signal weights.
 */
export async function generateRecommendations(
  input: RecommendationInput,
): Promise<{
  recommendations: Recommendations;
  model: string;
  promptVersion: string;
}> {
  const raw = await completeJson({
    system: SYSTEM_PROMPT,
    user: buildUserPrompt(input),
  });
  // Parse-or-throw: unvalidated model output never reaches storage or UI.
  const recommendations = recommendationsSchema.parse(JSON.parse(raw));
  return {
    recommendations,
    model: getModelName(),
    promptVersion: PROMPT_VERSION,
  };
}

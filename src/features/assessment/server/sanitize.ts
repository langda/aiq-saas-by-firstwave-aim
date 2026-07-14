import "server-only";

import type { PublicQuestion } from "../types";

/**
 * THE ONLY EXIT DOOR for question data to the client (ARCHITECTURE §16).
 * Builds a payload field-by-field — never spreads a database row — so new
 * columns (or joined signal data) can never leak by accident. The paired
 * test asserts the output contains no scoring-related keys.
 */
export function toPublicQuestion(input: {
  id: string;
  title: string;
  scenario: string;
  options: Array<{ id: string; content: string }>;
  orderedOptionIds: string[];
}): PublicQuestion {
  const byId = new Map(input.options.map((o) => [o.id, o]));
  return {
    id: input.id,
    title: input.title,
    scenario: input.scenario,
    options: input.orderedOptionIds.flatMap((optionId) => {
      const option = byId.get(optionId);
      return option ? [{ id: option.id, content: option.content }] : [];
    }),
  };
}

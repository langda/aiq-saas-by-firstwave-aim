import { z } from "zod";

import { seededShuffle } from "../random";

/**
 * Question selection strategies (ARCHITECTURE §10) — data, not code.
 * `assessments.selection_strategy` is parsed against this schema; adaptive
 * selection (V4) becomes a new variant here without touching sessions.
 */
export const selectionStrategySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("fixed"), shuffle: z.boolean().default(true) }),
  z.object({
    type: z.literal("random"),
    count: z.number().int().positive(),
    tags: z.array(z.string()).optional(),
  }),
]);

export type SelectionStrategy = z.infer<typeof selectionStrategySchema>;

export type SelectableQuestion = {
  questionId: string;
  position?: number | null;
  tags?: string[];
};

/** Picks and orders the questions a session will serve. Deterministic per seed. */
export function selectQuestions(input: {
  strategy: SelectionStrategy;
  pool: SelectableQuestion[];
  seed: string;
}): string[] {
  const { strategy, pool, seed } = input;

  if (strategy.type === "fixed") {
    const ordered = [...pool]
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((q) => q.questionId);
    return strategy.shuffle
      ? seededShuffle(ordered, `${seed}:questions`)
      : ordered;
  }

  // random: filter by tags (if any), shuffle, take count.
  const eligible = strategy.tags?.length
    ? pool.filter((q) => q.tags?.some((t) => strategy.tags!.includes(t)))
    : pool;
  return seededShuffle(eligible, `${seed}:questions`)
    .slice(0, strategy.count)
    .map((q) => q.questionId);
}

/** Option display order for one question. Deterministic per seed + question. */
export function orderOptions(
  optionIds: string[],
  seed: string,
  questionId: string,
): string[] {
  return seededShuffle(optionIds, `${seed}:options:${questionId}`);
}

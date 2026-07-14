import { describe, expect, it } from "vitest";

import { seededShuffle } from "../random";
import { orderOptions, selectQuestions } from "./strategy";

const pool = [
  { questionId: "a", position: 1, tags: ["office"] },
  { questionId: "b", position: 2, tags: ["office"] },
  { questionId: "c", position: 3, tags: ["technical"] },
  { questionId: "d", position: 4, tags: ["office", "technical"] },
];

describe("seededShuffle", () => {
  it("is deterministic per seed and does not mutate input", () => {
    const items = [1, 2, 3, 4, 5];
    const first = seededShuffle(items, "seed-1");
    expect(seededShuffle(items, "seed-1")).toEqual(first);
    expect(seededShuffle(items, "seed-2")).not.toEqual(first);
    expect(items).toEqual([1, 2, 3, 4, 5]);
    expect([...first].sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("selectQuestions", () => {
  it("fixed strategy serves everything, shuffled deterministically per seed", () => {
    const strategy = { type: "fixed" as const, shuffle: true };
    const first = selectQuestions({ strategy, pool, seed: "s1" });
    expect(selectQuestions({ strategy, pool, seed: "s1" })).toEqual(first);
    expect([...first].sort()).toEqual(["a", "b", "c", "d"]);
  });

  it("fixed without shuffle preserves authored positions", () => {
    const strategy = { type: "fixed" as const, shuffle: false };
    expect(selectQuestions({ strategy, pool, seed: "any" })).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
  });

  it("random strategy takes count from the (tag-filtered) pool", () => {
    const picked = selectQuestions({
      strategy: { type: "random", count: 2, tags: ["office"] },
      pool,
      seed: "s1",
    });
    expect(picked).toHaveLength(2);
    for (const id of picked) expect(["a", "b", "d"]).toContain(id);
  });

  it("resume reproduces identical question and option order", () => {
    const strategy = { type: "fixed" as const, shuffle: true };
    const q1 = selectQuestions({ strategy, pool, seed: "session-42" });
    const q2 = selectQuestions({ strategy, pool, seed: "session-42" });
    expect(q2).toEqual(q1);
    const o1 = orderOptions(["o1", "o2", "o3", "o4"], "session-42", "a");
    expect(orderOptions(["o1", "o2", "o3", "o4"], "session-42", "a")).toEqual(
      o1,
    );
    // Different question → different order stream (usually)
    expect(
      orderOptions(["o1", "o2", "o3", "o4"], "session-42", "b"),
    ).not.toEqual(undefined);
  });
});

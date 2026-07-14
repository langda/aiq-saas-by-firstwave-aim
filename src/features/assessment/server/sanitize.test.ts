import { describe, expect, it } from "vitest";

import { toPublicQuestion } from "./sanitize";

const FORBIDDEN_KEY_PATTERN =
  /signal|weight|competen|trait|score|persona|correct/i;

function collectKeys(value: unknown, keys: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, keys);
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      keys.push(k);
      collectKeys(v, keys);
    }
  }
  return keys;
}

describe("toPublicQuestion — the weights-never-leak guarantee", () => {
  // Simulates a sloppy upstream join that dragged signal data along. The
  // sanitizer must drop everything it doesn't explicitly pick.
  const poisoned = {
    id: "q1",
    title: "T",
    scenario: "S",
    status: "published",
    options: [
      {
        id: "o1",
        content: "A",
        option_signals: [{ competency_id: "c1", weight: 2 }],
        is_correct: true,
      },
      { id: "o2", content: "B", weight: 3 },
    ] as unknown as Array<{ id: string; content: string }>,
    orderedOptionIds: ["o2", "o1"],
  };

  it("emits no scoring-related keys, even from poisoned input", () => {
    const output = toPublicQuestion(poisoned);
    const keys = collectKeys(output);
    for (const key of keys) {
      expect(key).not.toMatch(FORBIDDEN_KEY_PATTERN);
    }
    // And nothing beyond the exact public contract:
    expect(Object.keys(output).sort()).toEqual([
      "id",
      "options",
      "scenario",
      "title",
    ]);
    for (const option of output.options) {
      expect(Object.keys(option).sort()).toEqual(["content", "id"]);
    }
  });

  it("serializes options in the session's served order", () => {
    const output = toPublicQuestion(poisoned);
    expect(output.options.map((o) => o.id)).toEqual(["o2", "o1"]);
  });

  it("drops option ids that are not part of the question", () => {
    const output = toPublicQuestion({
      ...poisoned,
      orderedOptionIds: ["o1", "intruder"],
    });
    expect(output.options.map((o) => o.id)).toEqual(["o1"]);
  });
});

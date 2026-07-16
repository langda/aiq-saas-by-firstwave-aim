import { describe, expect, it } from "vitest";

import { composeFallback, type FallbackTemplate } from "./fallback";

const templates: FallbackTemplate[] = ["a", "b", "c", "d", "e"].map((slug) => ({
  competencySlug: slug,
  title: `Title ${slug}`,
  why: `Why ${slug}`,
  how: `How ${slug}`,
}));

describe("composeFallback", () => {
  it("prefers blind spots, then fills from lowest measured scores", () => {
    const result = composeFallback({
      templates,
      blindSpots: ["c"],
      competencyScores: { a: 90, b: 10, c: 20, d: 30, e: null },
    });
    // c (blind spot), then b (10), then c would repeat → d (30 beats a's 90? no: b=10, c=20 deduped, d=30)
    expect(result?.actions.map((a) => a.title)).toEqual([
      "Title c",
      "Title b",
      "Title d",
    ]);
  });

  it("deduplicates when blind spots overlap lowest scores", () => {
    const result = composeFallback({
      templates,
      blindSpots: ["b", "c", "d"],
      competencyScores: { b: 5, c: 10, d: 15, a: 80 },
    });
    expect(result?.actions).toHaveLength(3);
    expect(new Set(result?.actions.map((a) => a.title)).size).toBe(3);
  });

  it("skips slugs without templates and still fills three", () => {
    const result = composeFallback({
      templates,
      blindSpots: ["missing-slug", "a"],
      competencyScores: { a: 50, b: 60, c: 70 },
    });
    expect(result?.actions.map((a) => a.title)).toEqual([
      "Title a",
      "Title b",
      "Title c",
    ]);
  });

  it("returns null when three actions cannot be assembled", () => {
    const result = composeFallback({
      templates: templates.slice(0, 2),
      blindSpots: [],
      competencyScores: { a: 10, b: 20 },
    });
    expect(result).toBeNull();
  });
});

import { describe, expect, it } from "vitest";

import { validateForPublish, type AuthoringOption } from "./authoring";

const SLUGS = ["alpha", "beta", "gamma"];

function option(overrides?: Partial<AuthoringOption>): AuthoringOption {
  return {
    content: "A reasonable choice",
    signals: [{ competencySlug: "alpha", weight: 2 }],
    ...overrides,
  };
}

function fourGoodOptions(): AuthoringOption[] {
  return [
    option({ signals: [{ competencySlug: "alpha", weight: 2 }] }),
    option({ signals: [{ competencySlug: "beta", weight: 2 }] }),
    option({
      signals: [
        { competencySlug: "gamma", weight: 1.5 },
        { competencySlug: "alpha", weight: 0.5 },
      ],
    }),
    option({ signals: [{ competencySlug: "beta", weight: 2 }] }),
  ];
}

describe("validateForPublish", () => {
  it("accepts a well-formed question", () => {
    const check = validateForPublish(fourGoodOptions(), SLUGS);
    expect(check.errors).toEqual([]);
  });

  it("requires exactly 4 options", () => {
    const check = validateForPublish(fourGoodOptions().slice(0, 3), SLUGS);
    expect(check.errors.some((e) => e.includes("exactly 4 options"))).toBe(
      true,
    );
  });

  it("requires 1–3 signals per option", () => {
    const none = fourGoodOptions();
    none[0] = option({ signals: [] });
    expect(
      validateForPublish(none, SLUGS).errors.some((e) =>
        e.includes("no behavioral signals"),
      ),
    ).toBe(true);
  });

  it("rejects unknown competencies, duplicates, and out-of-range weights", () => {
    const bad = fourGoodOptions();
    bad[1] = option({
      signals: [
        { competencySlug: "ghost", weight: 2 },
        { competencySlug: "alpha", weight: 4 },
        { competencySlug: "alpha", weight: 1 },
      ],
    });
    const { errors } = validateForPublish(bad, SLUGS);
    expect(errors.some((e) => e.includes('unknown competency "ghost"'))).toBe(
      true,
    );
    expect(errors.some((e) => e.includes("duplicate signal"))).toBe(true);
    expect(errors.some((e) => e.includes("outside the 0.5–3.0"))).toBe(true);
  });

  it("requires at least 2 distinct competencies across the question", () => {
    const narrow = fourGoodOptions().map(() =>
      option({ signals: [{ competencySlug: "alpha", weight: 2 }] }),
    );
    expect(
      validateForPublish(narrow, SLUGS).errors.some((e) =>
        e.includes("at least 2 distinct competencies"),
      ),
    ).toBe(true);
  });

  it("warns (not errors) on unbalanced option totals", () => {
    const unbalanced = fourGoodOptions();
    unbalanced[0] = option({
      signals: [
        { competencySlug: "alpha", weight: 3 },
        { competencySlug: "beta", weight: 3 },
      ],
    });
    unbalanced[1] = option({
      signals: [{ competencySlug: "beta", weight: 0.5 }],
    });
    const check = validateForPublish(unbalanced, SLUGS);
    expect(check.errors).toEqual([]);
    expect(check.warnings.some((w) => w.includes("unbalanced"))).toBe(true);
  });
});

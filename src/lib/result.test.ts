import { describe, expect, it } from "vitest";

import { err, ok } from "./result";

describe("Result helpers", () => {
  it("wraps data in an ok result", () => {
    const r = ok({ id: 1 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data).toEqual({ id: 1 });
  });

  it("wraps a coded error in an err result", () => {
    const r = err("forbidden", "Not allowed");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("forbidden");
      expect(r.error.message).toBe("Not allowed");
    }
  });
});

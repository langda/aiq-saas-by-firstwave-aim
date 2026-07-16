import { describe, expect, it } from "vitest";

import { getAchievement } from "./achievements";

describe("getAchievement", () => {
  it("maps score bands to approved levels", () => {
    expect(getAchievement(0).name).toBe("Spark");
    expect(getAchievement(24).name).toBe("Spark");
    expect(getAchievement(25).name).toBe("Rising");
    expect(getAchievement(44).name).toBe("Rising");
    expect(getAchievement(45).name).toBe("Flow");
    expect(getAchievement(64).name).toBe("Flow");
    expect(getAchievement(65).name).toBe("Surge");
    expect(getAchievement(84).name).toBe("Surge");
    expect(getAchievement(85).name).toBe("Apex");
    expect(getAchievement(100).name).toBe("Apex");
  });

  it("never awards fewer than two stars (No Shame Rule)", () => {
    for (let score = 0; score <= 100; score++) {
      expect(getAchievement(score).stars).toBeGreaterThanOrEqual(2);
    }
  });

  it("only Apex glows", () => {
    expect(getAchievement(90).glow).toBe(true);
    expect(getAchievement(70).glow).toBe(false);
  });
});

import { describe, expect, it } from "vitest";

import {
  canAccessAdminArea,
  canManageContent,
  canTakeAssessment,
  canViewOwnResults,
} from "./authz";
import type { AuthContext, Role } from "./types";

function ctx(role: Role, isAnonymous = false): AuthContext {
  return { userId: "u1", role, orgId: null, isAnonymous };
}

describe("authz capabilities", () => {
  it("only super_admin can access the admin area or manage content", () => {
    expect(canAccessAdminArea(ctx("super_admin"))).toBe(true);
    expect(canManageContent(ctx("super_admin"))).toBe(true);
    for (const role of ["org_admin", "trainer", "user"] as const) {
      expect(canAccessAdminArea(ctx(role))).toBe(false);
      expect(canManageContent(ctx(role))).toBe(false);
    }
  });

  it("an anonymous super_admin claim never grants admin access", () => {
    expect(canAccessAdminArea(ctx("super_admin", true))).toBe(false);
    expect(canManageContent(ctx("super_admin", true))).toBe(false);
  });

  it("anonymous users can take assessments but not view results (Decision 1)", () => {
    expect(canTakeAssessment(ctx("user", true))).toBe(true);
    expect(canViewOwnResults(ctx("user", true))).toBe(false);
    expect(canViewOwnResults(ctx("user", false))).toBe(true);
  });
});

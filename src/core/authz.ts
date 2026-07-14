import type { AuthContext } from "./types";

/**
 * Named capability checks (ARCHITECTURE §6). Services assert these; RLS is
 * the backstop. One place to change when roles evolve — never inline
 * role comparisons in features.
 */

export function canAccessAdminArea(ctx: AuthContext): boolean {
  return !ctx.isAnonymous && ctx.role === "super_admin";
}

export function canManageContent(ctx: AuthContext): boolean {
  // Questions, competencies, traits, personas, assessments (Decision 2).
  return !ctx.isAnonymous && ctx.role === "super_admin";
}

export function canTakeAssessment(_ctx: AuthContext): boolean {
  // Anonymous-first (Decision 1): every authenticated identity may assess.
  return true;
}

export function canViewOwnResults(ctx: AuthContext): boolean {
  // The result gate: anonymous users must create an account first (Decision 1).
  return !ctx.isAnonymous;
}

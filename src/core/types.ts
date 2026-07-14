/** Platform roles (IMPLEMENTATION_PLAN Phase 2, ARCHITECTURE §6). */
export type Role = "super_admin" | "org_admin" | "trainer" | "user";

/**
 * Authenticated request context. Resolved once per request by
 * lib/auth/context.ts and passed into services — services never read
 * cookies or headers themselves (PROJECT_STRUCTURE §8).
 */
export type AuthContext = {
  userId: string;
  role: Role;
  orgId: string | null;
  /** Anonymous users can take assessments but never see results (Decision 1). */
  isAnonymous: boolean;
};

/**
 * Cookie carrying proof-of-possession for anonymous → account claiming
 * (ARCHITECTURE §5.2). Set at submit time for anonymous users; consumed by
 * the claim service after the user signs in to an existing account.
 * Value format: `${sessionId}:${claimToken}`.
 */
export const CLAIM_COOKIE = "aiq_claim";

export function parseClaimCookie(
  value: string | undefined,
): { sessionId: string; claimToken: string } | null {
  if (!value) return null;
  const [sessionId, claimToken] = value.split(":");
  if (!sessionId || !claimToken) return null;
  return { sessionId, claimToken };
}

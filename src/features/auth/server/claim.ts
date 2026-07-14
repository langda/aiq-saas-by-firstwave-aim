import "server-only";

import type { AuthContext } from "@/core/types";
import { canViewOwnResults } from "@/core/authz";

import { parseClaimCookie } from "../claim-cookie";
import * as db from "./claim-db";

/**
 * Claims an anonymous user's completed session for a permanent account
 * (ARCHITECTURE §5.2). The riskiest flow in Decision 1: it re-parents rows
 * across user ids, so it demands proof-of-possession (the claim token minted
 * at submit) and a permanent caller. The database function is atomic and
 * invalidates the token on success.
 */
export async function claimFromCookie(
  ctx: AuthContext,
  cookieValue: string | undefined,
): Promise<{ claimed: boolean; sessionId: string | null }> {
  // Only a permanent account may receive claimed data (Decision 1).
  if (!canViewOwnResults(ctx)) return { claimed: false, sessionId: null };

  const parsed = parseClaimCookie(cookieValue);
  if (!parsed) return { claimed: false, sessionId: null };

  const claimed = await db.claimSession({
    sessionId: parsed.sessionId,
    claimToken: parsed.claimToken,
    newUserId: ctx.userId,
  });

  return { claimed, sessionId: claimed ? parsed.sessionId : null };
}

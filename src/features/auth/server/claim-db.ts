import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/** Executes the atomic claim function (service-role only; see migration 0005). */
export async function claimSession(input: {
  sessionId: string;
  claimToken: string;
  newUserId: string;
}): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("claim_session", {
    p_session_id: input.sessionId,
    p_claim_token: input.claimToken,
    p_new_user: input.newUserId,
  } as never);
  if (error) throw error;
  return data === true;
}

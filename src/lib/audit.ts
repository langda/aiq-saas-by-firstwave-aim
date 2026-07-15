import "server-only";

import type { AuthContext } from "@/core/types";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Audit trail for admin mutations (PROJECT_RULES, ARCHITECTURE §14). Written
 * with the service client because audit_logs has no client write policy —
 * an admin cannot suppress their own trail. Called by admin services as part
 * of the operation; failures are logged, never swallowed silently into UX.
 */
export async function auditLog(
  ctx: AuthContext,
  input: {
    action: string; // e.g. "question.publish"
    entityType: string;
    entityId: string;
    diff?: Record<string, unknown>;
  },
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("audit_logs").insert({
    actor_id: ctx.userId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    diff: (input.diff ?? {}) as never,
  });
  if (error)
    console.error("audit log write failed", input.action, error.message);
}

import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { AuthContext, Role } from "@/core/types";

const VALID_ROLES: readonly Role[] = [
  "super_admin",
  "org_admin",
  "trainer",
  "user",
];

/**
 * Resolves the AuthContext for the current request, or null when signed out.
 * `role` and `org_id` are stamped into app_metadata by a Supabase Auth Hook
 * (wired in Milestone 1 with the profiles table); until then every user
 * resolves to the default "user" role.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const claimedRole = user.app_metadata?.role as Role | undefined;
  const role: Role =
    claimedRole && VALID_ROLES.includes(claimedRole) ? claimedRole : "user";

  return {
    userId: user.id,
    role,
    orgId: (user.app_metadata?.org_id as string | undefined) ?? null,
    isAnonymous: user.is_anonymous ?? false,
  };
}

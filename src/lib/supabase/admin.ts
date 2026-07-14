import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";

/**
 * Service-role client — BYPASSES RLS. Only for service-layer code that has
 * already performed explicit authorization (ARCHITECTURE §16): signal/config
 * reads for scoring, and session claiming. Never import from actions.ts,
 * components, or anything client-reachable.
 */
export function createAdminClient() {
  if (!serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. Admin client is unavailable.",
    );
  }
  return createSupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./database.types";

import { env } from "@/lib/env";

/** Browser client — auth UI only. Data reads come from RSC, never from here. */
export function createClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

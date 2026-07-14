import { z } from "zod";

/**
 * Client-safe environment. NEXT_PUBLIC_* values are inlined at build time,
 * so they must be referenced literally (not via dynamic keys).
 * Fails fast at module load — a misconfigured deploy never boots.
 */
const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export const env = clientSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

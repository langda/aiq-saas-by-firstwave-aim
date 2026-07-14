import "server-only";
import { z } from "zod";

/**
 * Server-only environment. The service-role key bypasses RLS — it must never
 * be importable from client code (`server-only` enforces this at build time).
 * Optional until Milestone 1 wires the first service-role code path.
 */
const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

export const serverEnv = serverSchema.parse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

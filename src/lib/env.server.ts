import "server-only";
import { z } from "zod";

/**
 * Server-only environment. The service-role key bypasses RLS — it must never
 * be importable from client code (`server-only` enforces this at build time).
 * Optional until Milestone 1 wires the first service-role code path.
 */
const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  /** Resend (Decision: transactional email provider). Emails skip silently when unset. */
  RESEND_API_KEY: z.string().min(1).optional(),
  /** Verified sender, e.g. "AIQ <certificates@yourdomain.com>". */
  EMAIL_FROM: z.string().min(3).optional(),
  /** Public origin for links in emails, e.g. https://aiq.example.com */
  APP_URL: z.string().url().optional(),
});

export const serverEnv = serverSchema.parse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  APP_URL: process.env.APP_URL,
});

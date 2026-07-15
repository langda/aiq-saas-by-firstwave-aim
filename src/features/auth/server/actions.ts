"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAuthContext } from "@/lib/auth/context";
import { err, ok, type Result } from "@/lib/result";
import { strings } from "@/lib/strings";
import { createClient } from "@/lib/supabase/server";
import { CLAIM_COOKIE } from "../claim-cookie";
import { loginSchema, resetPasswordSchema, signupSchema } from "../schemas";
import { claimFromCookie } from "./claim";

/** Only same-site relative paths are honored as post-auth destinations. */
function safeNext(value: unknown): string | null {
  return typeof value === "string" && /^\/(?!\/)/.test(value) ? value : null;
}

export async function login(
  _prev: Result<null> | null,
  formData: FormData,
): Promise<Result<null>> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return err("invalid_input", strings.errors.invalidInput);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return err("unauthenticated", strings.errors.authFailed);

  redirect(safeNext(formData.get("next")) ?? "/dashboard");
}

/**
 * Anonymous → permanent conversion in place (ARCHITECTURE §5.1): same
 * user_id, so the completed session and result are already attached.
 */
export async function convertAnonymousAccount(
  _prev: Result<null> | null,
  formData: FormData,
): Promise<Result<null>> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return err("invalid_input", strings.errors.invalidInput);

  const ctx = await getAuthContext();
  if (!ctx?.isAnonymous) redirect(ctx ? "/claim" : "/login?next=/claim");

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    email: parsed.data.email,
    password: parsed.data.password,
    data: { full_name: parsed.data.fullName },
  });
  if (error) return err("internal", strings.errors.signupFailed);

  // Pick up the permanent (is_anonymous=false) claims immediately — the
  // results RLS policy reads them from the JWT.
  await supabase.auth.refreshSession();
  redirect("/claim");
}

/**
 * Post-auth claim completion: invalidates the claim token (and re-parents the
 * session if the user signed in to a different, existing account), then
 * forwards to the results the user came for.
 */
export async function finishClaim(): Promise<void> {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login?next=/claim");
  if (ctx.isAnonymous) redirect("/claim");

  const cookieStore = await cookies();
  const { sessionId } = await claimFromCookie(
    ctx,
    cookieStore.get(CLAIM_COOKIE)?.value,
  );
  cookieStore.delete(CLAIM_COOKIE);
  if (sessionId) {
    // The anonymous-first funnel issues certificates before an email exists —
    // now that this session has an owner with an address, send it.
    const { emailCertificateForSession } =
      await import("@/features/certificates/server/service");
    await emailCertificateForSession(sessionId);
  }
  redirect(sessionId ? `/results/${sessionId}` : "/dashboard");
}

export async function signup(
  _prev: Result<null> | null,
  formData: FormData,
): Promise<Result<null>> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return err("invalid_input", strings.errors.invalidInput);

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  });
  if (error) return err("internal", strings.errors.signupFailed);

  redirect("/dashboard");
}

export async function requestPasswordReset(
  _prev: Result<null> | null,
  formData: FormData,
): Promise<Result<null>> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return err("invalid_input", strings.errors.invalidInput);

  const supabase = await createClient();
  // Deliberately ignore "user not found" — never reveal account existence.
  await supabase.auth.resetPasswordForEmail(parsed.data.email);
  return ok(null);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

"use server";

import { redirect } from "next/navigation";

import { err, ok, type Result } from "@/lib/result";
import { strings } from "@/lib/strings";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, resetPasswordSchema, signupSchema } from "../schemas";

export async function login(
  _prev: Result<null> | null,
  formData: FormData,
): Promise<Result<null>> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return err("invalid_input", strings.errors.invalidInput);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return err("unauthenticated", strings.errors.authFailed);

  redirect("/dashboard");
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

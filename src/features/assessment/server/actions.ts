"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { CLAIM_COOKIE } from "@/features/auth/claim-cookie";
import { getAuthContext } from "@/lib/auth/context";
import { err, ok, type Result } from "@/lib/result";
import { strings } from "@/lib/strings";
import { createClient } from "@/lib/supabase/server";

import {
  saveAnswerSchema,
  startAssessmentSchema,
  submitAssessmentSchema,
} from "../schemas";
import * as service from "./service";
import { ServiceError } from "./service";

function toActionError<T>(error: unknown): Result<T> {
  if (error instanceof ServiceError) return err(error.code, error.message);
  console.error("assessment action failed", error);
  return err("internal", strings.errors.genericBody);
}

/**
 * Start (or resume) an assessment. Anonymous-first (Decision 1): with no
 * session present, a Supabase anonymous sign-in is created transparently.
 */
export async function startAssessment(formData: FormData): Promise<void> {
  const parsed = startAssessmentSchema.safeParse({
    slug: formData.get("slug"),
  });
  if (!parsed.success) redirect("/");

  let ctx = await getAuthContext();
  if (!ctx) {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error("anonymous sign-in failed", error.message);
      redirect(`/assessment/${parsed.data.slug}?error=start`);
    }
    ctx = await getAuthContext();
  }
  if (!ctx) redirect(`/assessment/${parsed.data.slug}?error=start`);

  try {
    await service.startSession(ctx, parsed.data.slug);
  } catch (error) {
    console.error("startSession failed", error);
    redirect(`/assessment/${parsed.data.slug}?error=start`);
  }
  redirect(`/assessment/${parsed.data.slug}`);
}

export async function saveAnswer(
  input: unknown,
): Promise<Result<{ saved: true }>> {
  const parsed = saveAnswerSchema.safeParse(input);
  if (!parsed.success) return err("invalid_input", strings.errors.invalidInput);

  const ctx = await getAuthContext();
  if (!ctx) return err("unauthenticated", strings.errors.genericBody);

  try {
    await service.saveAnswer(ctx, parsed.data);
    return ok({ saved: true });
  } catch (error) {
    return toActionError(error);
  }
}

export async function submitAssessment(input: unknown): Promise<Result<never>> {
  const parsed = submitAssessmentSchema.safeParse(input);
  if (!parsed.success) return err("invalid_input", strings.errors.invalidInput);

  const ctx = await getAuthContext();
  if (!ctx) return err("unauthenticated", strings.errors.genericBody);

  let outcome: { sessionId: string; claimToken: string | null };
  try {
    outcome = await service.submitSession(ctx, parsed.data.sessionId);
  } catch (error) {
    return toActionError(error);
  }

  if (ctx.isAnonymous) {
    if (outcome.claimToken) {
      // Proof-of-possession survives a login that swaps the auth identity.
      const cookieStore = await cookies();
      cookieStore.set(
        CLAIM_COOKIE,
        `${outcome.sessionId}:${outcome.claimToken}`,
        {
          httpOnly: true,
          sameSite: "lax",
          secure: true,
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        },
      );
    }
    redirect("/claim");
  }
  redirect(`/results/${outcome.sessionId}`);
}

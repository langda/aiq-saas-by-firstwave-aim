"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAuthContext } from "@/lib/auth/context";
import { err, ok, type Result } from "@/lib/result";
import { strings } from "@/lib/strings";

import type { AuthoringCheck } from "../authoring";
import { questionIdSchema, questionUpsertSchema } from "../schemas";
import * as service from "./service";
import { AuthoringError } from "./service";

function toError<T>(error: unknown): Result<T> {
  if (error instanceof AuthoringError) return err(error.code, error.message);
  console.error("question action failed", error);
  return err("internal", strings.errors.genericBody);
}

export async function saveQuestion(
  input: unknown,
): Promise<Result<{ id: string }>> {
  const parsed = questionUpsertSchema.safeParse(input);
  if (!parsed.success) return err("invalid_input", strings.errors.invalidInput);

  const ctx = await getAuthContext();
  if (!ctx) return err("unauthenticated", strings.errors.genericBody);

  try {
    const saved = await service.saveQuestion(ctx, parsed.data);
    revalidatePath("/admin/questions");
    return ok(saved);
  } catch (error) {
    return toError(error);
  }
}

export async function publishQuestion(
  input: unknown,
): Promise<Result<AuthoringCheck>> {
  const parsed = questionIdSchema.safeParse(input);
  if (!parsed.success) return err("invalid_input", strings.errors.invalidInput);

  const ctx = await getAuthContext();
  if (!ctx) return err("unauthenticated", strings.errors.genericBody);

  try {
    const check = await service.publishQuestion(ctx, parsed.data.id);
    revalidatePath("/admin/questions");
    revalidatePath(`/admin/questions/${parsed.data.id}`);
    return ok(check);
  } catch (error) {
    return toError(error);
  }
}

export async function retireQuestion(formData: FormData): Promise<void> {
  const parsed = questionIdSchema.safeParse({ id: formData.get("id") });
  const target = formData.get("target") === "archived" ? "archived" : "draft";
  const ctx = await getAuthContext();
  if (!parsed.success || !ctx) redirect("/admin/questions");

  try {
    await service.retireQuestion(ctx, parsed.data.id, target);
  } catch (error) {
    const message =
      error instanceof AuthoringError
        ? error.message
        : strings.errors.genericBody;
    redirect(`/admin/questions?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/admin/questions");
}

export async function toggleAssessmentPublished(
  formData: FormData,
): Promise<void> {
  const id = String(formData.get("id"));
  const publish = formData.get("publish") === "true";
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login");

  try {
    await service.setAssessmentPublished(ctx, id, publish);
  } catch (error) {
    const message =
      error instanceof AuthoringError
        ? error.message
        : strings.errors.genericBody;
    redirect(`/admin/assessments?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/admin/assessments");
}

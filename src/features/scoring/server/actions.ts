"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAuthContext } from "@/lib/auth/context";
import { err, ok, type Result } from "@/lib/result";
import { strings } from "@/lib/strings";

import * as service from "./service";
import { ScoringAdminError } from "./service";

export async function saveScoringDraft(
  _prev: Result<{ version: number }> | null,
  formData: FormData,
): Promise<Result<{ version: number }>> {
  const rawJson = String(formData.get("config") ?? "");
  const ctx = await getAuthContext();
  if (!ctx) return err("unauthenticated", strings.errors.genericBody);

  try {
    const saved = await service.saveDraft(ctx, rawJson);
    revalidatePath("/admin/scoring");
    return ok({ version: saved.version });
  } catch (error) {
    if (error instanceof ScoringAdminError)
      return err(error.code, error.message);
    console.error("scoring draft save failed", error);
    return err("internal", strings.errors.genericBody);
  }
}

export async function activateScoringConfig(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login");

  try {
    await service.activateConfig(ctx, id);
  } catch (error) {
    const message =
      error instanceof ScoringAdminError ? error.message : "failed";
    redirect(`/admin/scoring?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/admin/scoring");
}

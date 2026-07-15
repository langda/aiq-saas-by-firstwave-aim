"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAuthContext } from "@/lib/auth/context";
import { err, type Result } from "@/lib/result";
import { strings } from "@/lib/strings";

import { taxonomyItemSchema, taxonomyKindSchema } from "../schemas";
import * as service from "./service";
import { TaxonomyError } from "./service";

function toError<T>(error: unknown): Result<T> {
  if (error instanceof TaxonomyError) return err(error.code, error.message);
  console.error("taxonomy action failed", error);
  return err("internal", strings.errors.genericBody);
}

export async function saveTaxonomyItem(
  _prev: Result<null> | null,
  formData: FormData,
): Promise<Result<null>> {
  const kind = taxonomyKindSchema.safeParse(formData.get("kind"));
  const parsed = taxonomyItemSchema.safeParse({
    id: formData.get("id") || undefined,
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    displayOrder: formData.get("displayOrder") ?? 0,
  });
  if (!kind.success || !parsed.success)
    return err("invalid_input", strings.errors.invalidInput);

  const ctx = await getAuthContext();
  if (!ctx) return err("unauthenticated", strings.errors.genericBody);

  try {
    await service.saveItem(ctx, kind.data, parsed.data);
  } catch (error) {
    return toError(error);
  }
  const listPath = `/admin/${kind.data === "competency" ? "competencies" : "personas"}`;
  revalidatePath(listPath);
  redirect(listPath);
}

export async function setTaxonomyStatus(formData: FormData): Promise<void> {
  const kind = taxonomyKindSchema.parse(formData.get("kind"));
  const id = String(formData.get("id"));
  const status =
    formData.get("status") === "archived" ? "archived" : "published";

  const ctx = await getAuthContext();
  if (!ctx) redirect("/login");

  try {
    await service.setStatus(ctx, kind, id, status);
  } catch (error) {
    // Surface via query param — form actions from list rows have no state hook.
    const listPath = `/admin/${kind === "competency" ? "competencies" : "personas"}`;
    const message = error instanceof TaxonomyError ? error.message : "failed";
    redirect(`${listPath}?error=${encodeURIComponent(message)}`);
  }
  revalidatePath(
    `/admin/${kind === "competency" ? "competencies" : "personas"}`,
  );
}

import "server-only";

import { canManageContent } from "@/core/authz";
import type { AuthContext } from "@/core/types";
import { auditLog } from "@/lib/audit";

import type { TaxonomyItemInput, TaxonomyKind } from "../schemas";
import * as db from "./db";

export class TaxonomyError extends Error {
  constructor(
    public readonly code: "forbidden" | "not_found" | "conflict",
    message: string,
  ) {
    super(message);
  }
}

function assertAdmin(ctx: AuthContext) {
  if (!canManageContent(ctx))
    throw new TaxonomyError("forbidden", "Not allowed");
}

export async function saveItem(
  ctx: AuthContext,
  kind: TaxonomyKind,
  input: TaxonomyItemInput,
): Promise<{ id: string }> {
  assertAdmin(ctx);
  const row = {
    slug: input.slug,
    name: input.name,
    description: input.description,
    display_order: input.displayOrder,
  };

  if (input.id) {
    const existing = await db.getItem(kind, input.id);
    if (!existing) throw new TaxonomyError("not_found", "Item not found");
    // Slug is identity for scoring config signatures and signal aggregation —
    // renaming a competency slug in use would silently break the active
    // config's profile keys. Lock it once created.
    if (existing.slug !== input.slug)
      throw new TaxonomyError(
        "conflict",
        "Slug cannot be changed after creation",
      );
    await db.updateItem(kind, input.id, row);
    await auditLog(ctx, {
      action: `${kind}.update`,
      entityType: kind,
      entityId: input.id,
      diff: { before: existing, after: row },
    });
    return { id: input.id };
  }

  const created = await db.insertItem(kind, row);
  await auditLog(ctx, {
    action: `${kind}.create`,
    entityType: kind,
    entityId: created.id,
    diff: { after: row },
  });
  return created;
}

export async function setStatus(
  ctx: AuthContext,
  kind: TaxonomyKind,
  id: string,
  status: "published" | "archived",
): Promise<void> {
  assertAdmin(ctx);
  if (kind === "competency" && status === "archived") {
    const inUse = await db.countSignalsForCompetency(id);
    if (inUse > 0)
      throw new TaxonomyError(
        "conflict",
        `Competency is referenced by ${inUse} behavioral signals — remove them first`,
      );
  }
  await db.setItemStatus(kind, id, status);
  await auditLog(ctx, {
    action: `${kind}.${status === "archived" ? "archive" : "publish"}`,
    entityType: kind,
    entityId: id,
  });
}

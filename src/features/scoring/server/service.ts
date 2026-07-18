import "server-only";

import { canManageContent } from "@/core/authz";
import { parseScoringConfig } from "@/core/scoring/config";
import type { AuthContext } from "@/core/types";
import { auditLog } from "@/lib/audit";

import * as db from "./db";

export class ScoringAdminError extends Error {
  constructor(
    public readonly code: "forbidden" | "invalid_input" | "not_found",
    message: string,
  ) {
    super(message);
  }
}

function assertAdmin(ctx: AuthContext) {
  if (!canManageContent(ctx))
    throw new ScoringAdminError("forbidden", "Not allowed");
}

export async function listConfigs(ctx: AuthContext) {
  assertAdmin(ctx);
  return db.listConfigs();
}

/**
 * Save a new DRAFT version (Decision 15: signatures are config; configs are
 * immutable once created — changes are new versions, never edits, so every
 * historical result keeps pointing at exactly what scored it, §11.4).
 */
export async function saveDraft(
  ctx: AuthContext,
  rawJson: string,
): Promise<{ id: string; version: number }> {
  assertAdmin(ctx);

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new ScoringAdminError("invalid_input", "Not valid JSON.");
  }

  let config;
  try {
    config = parseScoringConfig(parsed);
  } catch (error) {
    throw new ScoringAdminError(
      "invalid_input",
      `Config rejected by the engine schema: ${error instanceof Error ? error.message.slice(0, 300) : "unknown"}`,
    );
  }

  // Referential checks the schema can't do: slugs must exist in the DB.
  const [personaSlugs, competencySlugs] = await Promise.all([
    db.listPersonaSlugs(),
    db.listCompetencySlugs(),
  ]);
  const personaSet = new Set(personaSlugs);
  const competencySet = new Set(competencySlugs);
  for (const signature of config.personas.signatures) {
    if (!personaSet.has(signature.persona))
      throw new ScoringAdminError(
        "invalid_input",
        `Unknown persona slug in signatures: ${signature.persona}`,
      );
  }
  if (!personaSet.has(config.personas.fallback))
    throw new ScoringAdminError(
      "invalid_input",
      `Unknown fallback persona: ${config.personas.fallback}`,
    );
  for (const slug of config.competencies) {
    if (!competencySet.has(slug))
      throw new ScoringAdminError(
        "invalid_input",
        `Unknown competency slug: ${slug}`,
      );
  }

  const version = (await db.getMaxVersion()) + 1;
  const created = await db.insertDraft({
    version,
    config: { ...config, version },
  });
  await auditLog(ctx, {
    action: "scoring_config.create_draft",
    entityType: "scoring_config",
    entityId: created.id,
    diff: { version },
  });
  return { id: created.id, version };
}

/** Activate any version (rollback = activating an older one). */
export async function activateConfig(
  ctx: AuthContext,
  id: string,
): Promise<void> {
  assertAdmin(ctx);
  const configs = await db.listConfigs();
  const target = configs.find((c) => c.id === id);
  if (!target) throw new ScoringAdminError("not_found", "Config not found");
  await db.activate(id);
  await auditLog(ctx, {
    action: "scoring_config.activate",
    entityType: "scoring_config",
    entityId: id,
    diff: { version: target.version },
  });
}

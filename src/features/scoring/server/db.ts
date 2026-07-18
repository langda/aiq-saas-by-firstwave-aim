import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Scoring-config data layer (Milestone 7). Runs through the cookie client:
 * scoring_configs has a super_admin-only RLS policy, so every operation is
 * database-enforced as well as service-checked.
 */

export async function listConfigs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scoring_configs")
    .select("id, version, status, config, created_at")
    .order("version", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getMaxVersion(): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scoring_configs")
    .select("version")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.version ?? 0;
}

export async function insertDraft(input: { version: number; config: unknown }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scoring_configs")
    .insert({
      version: input.version,
      config: input.config as never,
      status: "draft",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

/**
 * Activation: retire the current active, then activate the target. Two
 * statements (supabase-js has no client transactions); the partial unique
 * index on status='active' makes the failure mode "no active config" rather
 * than "two active configs" — submit fails loudly, admin re-activates.
 */
export async function activate(id: string) {
  const supabase = await createClient();
  const { error: retireError } = await supabase
    .from("scoring_configs")
    .update({ status: "retired" })
    .eq("status", "active");
  if (retireError) throw retireError;
  const { error } = await supabase
    .from("scoring_configs")
    .update({ status: "active" })
    .eq("id", id);
  if (error) throw error;
}

export async function listPersonaSlugs(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("personas").select("slug");
  if (error) throw error;
  return (data ?? []).map((p) => p.slug);
}

export async function listCompetencySlugs(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("competencies").select("slug");
  if (error) throw error;
  return (data ?? []).map((c) => c.slug);
}

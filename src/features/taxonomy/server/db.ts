import "server-only";

import { createClient } from "@/lib/supabase/server";

import type { TaxonomyKind } from "../schemas";

/**
 * Competency/persona CRUD runs through the COOKIE-BOUND client on purpose:
 * the super_admin RLS policies are exercised on every admin operation
 * (defense in depth) instead of being bypassed by the service role.
 */

const TABLE: Record<TaxonomyKind, "competencies" | "personas"> = {
  competency: "competencies",
  persona: "personas",
};

export async function listItems(kind: TaxonomyKind) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE[kind])
    .select("id, slug, name, description, display_order, status")
    .order("display_order");
  if (error) throw error;
  return data;
}

export async function getItem(kind: TaxonomyKind, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE[kind])
    .select("id, slug, name, description, display_order, status")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function insertItem(
  kind: TaxonomyKind,
  row: {
    slug: string;
    name: string;
    description: string;
    display_order: number;
  },
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE[kind])
    .insert(row)
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

export async function updateItem(
  kind: TaxonomyKind,
  id: string,
  row: {
    slug: string;
    name: string;
    description: string;
    display_order: number;
  },
) {
  const supabase = await createClient();
  const { error } = await supabase.from(TABLE[kind]).update(row).eq("id", id);
  if (error) throw error;
}

export async function setItemStatus(
  kind: TaxonomyKind,
  id: string,
  status: "published" | "archived",
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from(TABLE[kind])
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

/** Slugs referenced by the ACTIVE scoring config — guard against breaking it. */
export async function countSignalsForCompetency(competencyId: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("option_signals")
    .select("id", { count: "exact", head: true })
    .eq("competency_id", competencyId);
  if (error) throw error;
  return count ?? 0;
}

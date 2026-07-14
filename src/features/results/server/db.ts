import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Result reads run as the user — RLS enforces both ownership and the
 * permanent-account gate (Decision 1) at the database layer.
 */
export async function getResultBySession(sessionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("results")
    .select(
      "id, session_id, overall_score, competency_scores, persona_id, strengths, blind_spots, confidence, created_at",
    )
    .eq("session_id", sessionId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getPersona(personaId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("personas")
    .select("slug, name, description")
    .eq("id", personaId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getCompetencyNames() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("competencies")
    .select("slug, name, display_order")
    .order("display_order");
  if (error) throw error;
  return data;
}

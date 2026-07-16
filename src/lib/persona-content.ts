/**
 * Per-persona identity content (founder-approved taglines, Decision 20).
 * Keyed by persona slug; presentation-layer only. Falls back gracefully
 * for personas added later via the admin (until CMS-managed in Phase 7).
 */

export const personaTaglines: Record<string, string> = {
  explorer: "You're the one who tries it first.",
  "assistant-user": "You get things done — AI just makes it faster.",
  "ai-collaborator": "You and AI make each other better.",
  "ai-builder": "You don't use AI. You build with it.",
  "ai-architect": "You're designing how everyone else will work.",
};

export function getPersonaTagline(slug: string | undefined): string | null {
  return slug ? (personaTaglines[slug] ?? null) : null;
}

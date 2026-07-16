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

/**
 * Static showcase for public marketing surfaces ("Which one are you?").
 * Deliberately not a DB read: the landing page is static and unauthenticated;
 * these five are seed-stable and their artwork ships with the app.
 */
export const personaShowcase = [
  { slug: "explorer", name: "Explorer", artwork: "/personas/explorer.svg" },
  {
    slug: "assistant-user",
    name: "Assistant User",
    artwork: "/personas/assistant-user.svg",
  },
  {
    slug: "ai-collaborator",
    name: "AI Collaborator",
    artwork: "/personas/ai-collaborator.svg",
  },
  {
    slug: "ai-builder",
    name: "AI Builder",
    artwork: "/personas/ai-builder.svg",
  },
  {
    slug: "ai-architect",
    name: "AI Architect",
    artwork: "/personas/ai-architect.svg",
  },
] as const;

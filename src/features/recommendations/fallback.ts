import type { Recommendations } from "@/lib/ai/schemas";

/**
 * Static fallback composition (ARCHITECTURE §12: the mandatory floor).
 * Picks templates for the user's blind spots first, then fills from their
 * lowest measured competencies. Pure — unit-tested without a database.
 */

export type FallbackTemplate = {
  competencySlug: string;
  title: string;
  why: string;
  how: string;
};

export function composeFallback(input: {
  templates: FallbackTemplate[];
  blindSpots: string[];
  competencyScores: Record<string, number | null>;
}): Recommendations | null {
  const bySlug = new Map(input.templates.map((t) => [t.competencySlug, t]));

  const lowestFirst = Object.entries(input.competencyScores)
    .filter((e): e is [string, number] => e[1] !== null)
    .sort((a, b) => a[1] - b[1])
    .map(([slug]) => slug);

  const orderedSlugs = [...input.blindSpots, ...lowestFirst].filter(
    (slug, index, all) => all.indexOf(slug) === index,
  );

  const actions = orderedSlugs
    .flatMap((slug) => {
      const template = bySlug.get(slug);
      return template
        ? [{ title: template.title, why: template.why, how: template.how }]
        : [];
    })
    .slice(0, 3);

  return actions.length === 3 ? { actions } : null;
}

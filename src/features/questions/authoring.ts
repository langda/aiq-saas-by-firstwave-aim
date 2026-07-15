/**
 * Publish-gate validation — ASSESSMENT_MODEL §3.1 and §9 made executable.
 * Pure and product-agnostic: rules reference the supplied competency list,
 * never AIQ's own (Decision 16). Errors block publishing; warnings inform.
 */

export type AuthoringOption = {
  content: string;
  signals: Array<{ competencySlug: string; weight: number }>;
};

export type AuthoringCheck = { errors: string[]; warnings: string[] };

export function validateForPublish(
  options: AuthoringOption[],
  knownCompetencySlugs: string[],
): AuthoringCheck {
  const errors: string[] = [];
  const warnings: string[] = [];
  const known = new Set(knownCompetencySlugs);

  // §9.3: four options, four windows.
  if (options.length !== 4)
    errors.push(
      `A published question needs exactly 4 options (has ${options.length}).`,
    );

  const competenciesTouched = new Set<string>();
  const optionTotals: number[] = [];

  options.forEach((option, index) => {
    const label = `Option ${index + 1}`;
    if (!option.content.trim()) errors.push(`${label}: content is empty.`);

    // §3.1: every option emits 1–3 signals.
    if (option.signals.length === 0)
      errors.push(`${label}: has no behavioral signals (1–3 required).`);
    if (option.signals.length > 3)
      errors.push(
        `${label}: has ${option.signals.length} signals (max 3 — unfocused).`,
      );

    const seen = new Set<string>();
    let total = 0;
    for (const signal of option.signals) {
      if (!known.has(signal.competencySlug))
        errors.push(`${label}: unknown competency "${signal.competencySlug}".`);
      if (seen.has(signal.competencySlug))
        errors.push(
          `${label}: duplicate signal for "${signal.competencySlug}".`,
        );
      seen.add(signal.competencySlug);
      competenciesTouched.add(signal.competencySlug);
      // §3.1: typical weight range 0.5–3.0.
      if (signal.weight < 0.5 || signal.weight > 3)
        errors.push(
          `${label}: weight ${signal.weight} outside the 0.5–3.0 authoring range.`,
        );
      total += signal.weight;
    }
    optionTotals.push(total);
  });

  // §3.1: a question should collectively cover 2–4 distinct competencies.
  if (competenciesTouched.size < 2)
    errors.push(
      "Question must cover at least 2 distinct competencies across options.",
    );
  if (competenciesTouched.size > 4)
    warnings.push(
      `Question touches ${competenciesTouched.size} competencies — consider focusing (2–4 is the guideline).`,
    );

  // §3.1 balance rule: option signal totals within ~30% of siblings — options
  // are different windows, not bigger prizes. Advisory, not blocking.
  const positiveTotals = optionTotals.filter((t) => t > 0);
  if (positiveTotals.length > 1) {
    const max = Math.max(...positiveTotals);
    const min = Math.min(...positiveTotals);
    if (min < max * 0.7)
      warnings.push(
        `Option signal totals are unbalanced (min ${min}, max ${max}) — aim within ~30% of each other.`,
      );
  }

  return { errors, warnings };
}

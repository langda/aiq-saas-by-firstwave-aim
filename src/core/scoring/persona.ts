import type { ScoringConfig } from "./config";
import type { PersonaAffinity } from "./types";

/**
 * Persona assignment via signature-profile affinity (ARCHITECTURE §11.2,
 * Decision 3): personas are work styles — shapes over competencies — not
 * score ranges. Affinity = cosine similarity between the user's normalized
 * competency vector and each persona's signature vector. Competencies the
 * signature omits use the configured baseline; competencies the session
 * never measured are excluded from both vectors.
 */
export function computePersonaAssignment(input: {
  competencyScores: Record<string, number | null>;
  overallScore: number;
  config: ScoringConfig["personas"];
  competencies: string[];
}): {
  primaryPersona: string;
  secondaryPersona: string | null;
  affinities: PersonaAffinity[];
} {
  const { competencyScores, overallScore, config, competencies } = input;

  const measured = competencies.filter((c) => competencyScores[c] !== null);

  const affinities: PersonaAffinity[] = config.signatures.map((signature) => {
    let dot = 0;
    let userNorm = 0;
    let signatureNorm = 0;
    for (const slug of measured) {
      const user = (competencyScores[slug] as number) / 100;
      const sig = signature.profile[slug] ?? config.baseline;
      dot += user * sig;
      userNorm += user * user;
      signatureNorm += sig * sig;
    }
    const denominator = Math.sqrt(userNorm) * Math.sqrt(signatureNorm);
    const affinity = denominator > 0 ? dot / denominator : 0;

    const passedGates =
      signature.gates?.overallGte === undefined ||
      overallScore >= signature.gates.overallGte;

    return { persona: signature.persona, affinity, passedGates };
  });

  const eligible = affinities
    .filter((a) => a.passedGates)
    .sort((a, b) => b.affinity - a.affinity);

  const primaryPersona = eligible[0]?.persona ?? config.fallback;

  const runnerUp = eligible.find(
    (a) =>
      a.persona !== primaryPersona &&
      a.affinity >= config.secondary.minAffinity,
  );
  // Secondary is computed and stored from day one; display is post-MVP.
  const secondaryPersona = runnerUp?.persona ?? null;

  return { primaryPersona, secondaryPersona, affinities };
}

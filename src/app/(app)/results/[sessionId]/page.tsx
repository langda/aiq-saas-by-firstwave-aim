import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CertificateActions } from "@/features/certificates/components/certificate-actions";
import * as certificatesDb from "@/features/certificates/server/db";
import { AchievementStars } from "@/features/results/components/achievement-stars";
import { Reveal } from "@/features/results/components/reveal";
import { ShareButton } from "@/features/results/components/share-button";
import * as db from "@/features/results/server/db";
import { getAchievement } from "@/lib/achievements";
import { getPersonaTagline } from "@/lib/persona-content";
import { strings } from "@/lib/strings";

export const metadata: Metadata = { title: strings.results.title };

const competencyScoresSchema = z.record(z.string(), z.number().nullable());

/**
 * Result v3 (Decision 21): an identity reveal that fits one phone screen —
 * artwork, name, stars, one sentence, one superpower, share, continue.
 * No analytics anywhere (competency scores are engine-internal: they choose
 * the persona, the stars, and the superpower — users never see numbers).
 * Below the fold: only the certificate.
 */
export default async function ResultsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  if (!z.string().uuid().safeParse(sessionId).success) notFound();

  const result = await db.getResultBySession(sessionId);
  if (!result) notFound();

  const [persona, competencies, certificate] = await Promise.all([
    db.getPersona(result.persona_id),
    db.getCompetencyNames(),
    certificatesDb.getCertificateForSession(sessionId),
  ]);

  const scores = competencyScoresSchema.parse(result.competency_scores);
  const achievement = getAchievement(result.overall_score);
  const tagline = getPersonaTagline(persona?.slug);
  // The Superpower: highest measured competency (display order breaks ties).
  const superpower = competencies
    .map((c) => ({ name: c.name, score: scores[c.slug] }))
    .filter((c): c is { name: string; score: number } => c.score !== null)
    .sort((a, b) => b.score - a.score)[0];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-16">
      {/* ---------- THE REVEAL: one phone screen ---------- */}
      <section className="from-primary/15 via-primary/5 flex min-h-[80dvh] flex-col items-center justify-center gap-4 rounded-3xl bg-gradient-to-b to-transparent px-6 py-10 text-center md:gap-5">
        {persona?.artwork_url && (
          <Reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={persona.artwork_url}
              alt=""
              aria-hidden
              className="size-28 rounded-3xl shadow-xl md:size-40"
            />
          </Reveal>
        )}
        <Reveal delay={0.15}>
          <p className="text-primary text-sm font-medium tracking-widest uppercase">
            {strings.results.persona}
          </p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight text-balance md:text-6xl">
            {persona?.name ?? "—"}
          </h1>
        </Reveal>
        <Reveal delay={0.3}>
          <AchievementStars level={achievement} size="lg" />
        </Reveal>
        {tagline && (
          <Reveal delay={0.45}>
            <p className="max-w-md text-lg text-balance md:text-xl">
              {tagline}
            </p>
          </Reveal>
        )}
        {superpower && (
          <Reveal delay={0.55}>
            <Badge className="px-3 py-1 text-sm">
              ⚡ {strings.results.superpower}: {superpower.name}
            </Badge>
          </Reveal>
        )}
        <Reveal
          delay={0.7}
          className="mt-3 flex flex-wrap justify-center gap-3"
        >
          <ShareButton
            verifyCode={
              certificate && !certificate.revoked_at
                ? certificate.public_code
                : null
            }
            personaName={persona?.name ?? "—"}
          />
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<a href="#certificate" />}
          >
            {strings.results.continue}
          </Button>
        </Reveal>
      </section>

      {/* ---------- BELOW: the certificate, nothing else ---------- */}
      {certificate && !certificate.revoked_at && (
        <Card id="certificate" className="scroll-mt-8">
          <CardHeader>
            <CardTitle>{strings.certificate.sectionTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <CertificateActions code={certificate.public_code} />
          </CardContent>
        </Card>
      )}

      <p className="text-muted-foreground text-center text-sm">
        {new Date(result.created_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CertificateActions } from "@/features/certificates/components/certificate-actions";
import * as certificatesDb from "@/features/certificates/server/db";
import { RecommendationsPanel } from "@/features/recommendations/components/recommendations-panel";
import * as recommendations from "@/features/recommendations/server/service";
import { AchievementStars } from "@/features/results/components/achievement-stars";
import { CompetencyRadar } from "@/features/results/components/competency-radar";
import { Reveal } from "@/features/results/components/reveal";
import { ShareButton } from "@/features/results/components/share-button";
import * as db from "@/features/results/server/db";
import { getAchievement } from "@/lib/achievements";
import { getPersonaTagline } from "@/lib/persona-content";
import { strings } from "@/lib/strings";

export const metadata: Metadata = { title: strings.results.title };

const competencyScoresSchema = z.record(z.string(), z.number().nullable());
const confidenceSchema = z.object({
  value: z.number(),
  level: z.enum(["high", "moderate", "low"]),
});
const slugListSchema = z.array(z.string());

/**
 * Results v2 (Decision 20): the hero is a reveal, not a report — exactly six
 * elements, 10-Second Rule. Analysis lives below the fold. Engines untouched;
 * achievement levels are a display-only mapping (lib/achievements).
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

  const [persona, competencies, certificate, recommendation] =
    await Promise.all([
      db.getPersona(result.persona_id),
      db.getCompetencyNames(),
      certificatesDb.getCertificateForSession(sessionId),
      recommendations.getRecommendationsForSession(sessionId),
    ]);

  const scores = competencyScoresSchema.parse(result.competency_scores);
  const confidence = confidenceSchema.parse(result.confidence);
  const strengths = slugListSchema.parse(result.strengths);
  const growthAreas = slugListSchema.parse(result.blind_spots);
  const nameOf = new Map(competencies.map((c) => [c.slug, c.name]));
  const s = strings.results;

  const achievement = getAchievement(result.overall_score);
  const tagline = getPersonaTagline(persona?.slug);
  // The Superpower: highest measured competency (display order breaks ties).
  const superpower = competencies
    .map((c) => ({ name: c.name, score: scores[c.slug] }))
    .filter((c): c is { name: string; score: number } => c.score !== null)
    .sort((a, b) => b.score - a.score)[0];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-16">
      {/* ---------- THE HERO: six elements, ten seconds ---------- */}
      <section className="from-primary/15 via-primary/5 flex min-h-[70dvh] flex-col items-center justify-center gap-5 rounded-3xl bg-gradient-to-b to-transparent px-6 py-14 text-center">
        {persona?.artwork_url && (
          <Reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={persona.artwork_url}
              alt=""
              aria-hidden
              className="size-32 rounded-3xl shadow-xl md:size-40"
            />
          </Reveal>
        )}
        <Reveal delay={0.15}>
          <p className="text-primary text-sm font-medium tracking-widest uppercase">
            {s.persona}
          </p>
          <h1 className="mt-1 text-5xl font-semibold tracking-tight text-balance md:text-6xl">
            {persona?.name ?? "—"}
          </h1>
        </Reveal>
        <Reveal delay={0.3}>
          <AchievementStars level={achievement} size="lg" />
        </Reveal>
        {tagline && (
          <Reveal delay={0.45}>
            <p className="max-w-md text-xl text-balance">{tagline}</p>
          </Reveal>
        )}
        {superpower && (
          <Reveal delay={0.55}>
            <Badge className="px-3 py-1 text-sm">
              ⚡ {s.superpower}: {superpower.name}
            </Badge>
          </Reveal>
        )}
        <Reveal
          delay={0.7}
          className="mt-4 flex flex-wrap justify-center gap-3"
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
            render={<a href="#full-profile" />}
          >
            {s.continue}
          </Button>
        </Reveal>
      </section>

      {/* ---------- BELOW THE FOLD: the full profile ---------- */}
      <h2
        id="full-profile"
        className="text-muted-foreground scroll-mt-8 pt-4 text-sm font-medium tracking-widest uppercase"
      >
        {s.fullProfile}
      </h2>

      <Card>
        <CardHeader>
          <CardTitle>{s.competencies}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            {competencies.map((c) => {
              const score = scores[c.slug];
              return (
                <div key={c.slug} className="flex items-center gap-3">
                  <span className="w-36 shrink-0 text-sm md:w-40">
                    {c.name}
                  </span>
                  {score === null || score === undefined ? (
                    <span className="text-muted-foreground text-sm">
                      {s.notMeasured}
                    </span>
                  ) : (
                    <>
                      <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-sm tabular-nums">
                        {score}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <details className="group">
            <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-sm font-medium">
              {s.radarToggle}
            </summary>
            <CompetencyRadar
              data={competencies.map((c) => ({
                name: c.name,
                score: scores[c.slug] ?? null,
              }))}
            />
          </details>
          <p className="text-muted-foreground text-sm">
            {s.scoreDetail}: {result.overall_score} / 100
            {confidence.level === "low" && <> · {s.confidenceLow}</>}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{s.strengths}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap content-start gap-2">
            {strengths.length === 0 ? (
              <p className="text-muted-foreground text-sm">{s.noneYet}</p>
            ) : (
              strengths.map((slug) => (
                <Badge key={slug}>{nameOf.get(slug) ?? slug}</Badge>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{s.blindSpots}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap content-start gap-2">
            {growthAreas.length === 0 ? (
              <p className="text-muted-foreground text-sm">{s.noneYet}</p>
            ) : (
              growthAreas.map((slug) => (
                <Badge key={slug} variant="outline">
                  {nameOf.get(slug) ?? slug}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{strings.recommendations.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <RecommendationsPanel
            status={recommendation.status}
            actions={recommendation.actions}
          />
        </CardContent>
      </Card>

      {certificate && !certificate.revoked_at && (
        <Card>
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

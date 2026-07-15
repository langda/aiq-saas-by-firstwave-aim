import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CertificateActions } from "@/features/certificates/components/certificate-actions";
import * as certificatesDb from "@/features/certificates/server/db";
import { CompetencyRadar } from "@/features/results/components/competency-radar";
import { Reveal } from "@/features/results/components/reveal";
import * as db from "@/features/results/server/db";
import { strings } from "@/lib/strings";

export const metadata: Metadata = { title: strings.results.title };

const competencyScoresSchema = z.record(z.string(), z.number().nullable());
const confidenceSchema = z.object({
  value: z.number(),
  level: z.enum(["high", "moderate", "low"]),
});
const slugListSchema = z.array(z.string());

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
  const confidence = confidenceSchema.parse(result.confidence);
  const strengths = slugListSchema.parse(result.strengths);
  const blindSpots = slugListSchema.parse(result.blind_spots);
  const nameOf = new Map(competencies.map((c) => [c.slug, c.name]));
  const s = strings.results;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-16">
      {/* Persona reveal */}
      <Reveal>
        <section className="from-primary/10 via-primary/5 rounded-2xl bg-gradient-to-br to-transparent p-8 md:p-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-primary text-sm font-medium tracking-wide uppercase">
                {s.persona}
              </p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
                {persona?.name ?? "—"}
              </h1>
            </div>
            {persona?.artwork_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={persona.artwork_url}
                alt=""
                aria-hidden
                className="size-20 shrink-0 rounded-2xl shadow-sm md:size-24"
              />
            )}
          </div>
          <p className="text-muted-foreground mt-3 max-w-lg text-lg text-pretty">
            {persona?.description}
          </p>
          <div className="mt-6 flex items-center gap-6">
            <div>
              <p className="text-3xl font-semibold tabular-nums">
                {result.overall_score}
                <span className="text-muted-foreground text-lg font-normal">
                  {" "}
                  / 100
                </span>
              </p>
              <p className="text-muted-foreground text-sm">{s.overall}</p>
            </div>
            <div className="border-border h-10 border-l" aria-hidden />
            <div>
              <p className="font-medium capitalize">{confidence.level}</p>
              <p className="text-muted-foreground text-sm">{s.confidence}</p>
            </div>
          </div>
          {confidence.level === "low" && (
            <p className="text-muted-foreground mt-4 text-sm">
              {s.confidenceLow}
            </p>
          )}
        </section>
      </Reveal>

      {/* Radar + bars */}
      <Reveal delay={0.15}>
        <Card>
          <CardHeader>
            <CardTitle>{s.competencies}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <CompetencyRadar
              data={competencies.map((c) => ({
                name: c.name,
                score: scores[c.slug] ?? null,
              }))}
            />
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
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.25} className="grid gap-6 sm:grid-cols-2">
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
            {blindSpots.length === 0 ? (
              <p className="text-muted-foreground text-sm">{s.noneYet}</p>
            ) : (
              blindSpots.map((slug) => (
                <Badge key={slug} variant="outline">
                  {nameOf.get(slug) ?? slug}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>
      </Reveal>

      {certificate && !certificate.revoked_at && (
        <Reveal delay={0.28}>
          <Card>
            <CardHeader>
              <CardTitle>{strings.certificate.sectionTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <CertificateActions code={certificate.public_code} />
            </CardContent>
          </Card>
        </Reveal>
      )}

      <Reveal delay={0.3}>
        <p className="text-muted-foreground text-center text-sm">
          {new Date(result.created_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </Reveal>
    </div>
  );
}

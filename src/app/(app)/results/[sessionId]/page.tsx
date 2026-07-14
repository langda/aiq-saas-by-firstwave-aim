import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as db from "@/features/results/server/db";
import { strings } from "@/lib/strings";

export const metadata: Metadata = { title: strings.results.title };

const competencyScoresSchema = z.record(z.string(), z.number().nullable());
const confidenceSchema = z.object({
  value: z.number(),
  level: z.enum(["high", "moderate", "low"]),
});
const slugListSchema = z.array(z.string());

/**
 * Walking-skeleton results page (Milestone 1): correct data, raw display.
 * Charts, persona artwork, and recommendations arrive in Milestones 3/5.
 * RLS already guarantees ownership + the permanent-account gate.
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

  const [persona, competencies] = await Promise.all([
    db.getPersona(result.persona_id),
    db.getCompetencyNames(),
  ]);

  const scores = competencyScoresSchema.parse(result.competency_scores);
  const confidence = confidenceSchema.parse(result.confidence);
  const strengths = slugListSchema.parse(result.strengths);
  const blindSpots = slugListSchema.parse(result.blind_spots);
  const nameOf = new Map(competencies.map((c) => [c.slug, c.name]));

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{strings.results.title}</h1>
        <p className="text-muted-foreground text-sm">
          {new Date(result.created_at).toLocaleDateString()}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{strings.results.persona}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-3xl font-semibold">{persona?.name ?? "—"}</p>
          <p className="text-muted-foreground">{persona?.description}</p>
          <p className="pt-2 text-sm">
            {strings.results.overall}:{" "}
            <span className="font-semibold">{result.overall_score} / 100</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{strings.results.competencies}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {competencies.map((c) => {
            const score = scores[c.slug];
            return (
              <div key={c.slug} className="flex items-center gap-3">
                <span className="w-40 shrink-0 text-sm">{c.name}</span>
                {score === null || score === undefined ? (
                  <span className="text-muted-foreground text-sm">
                    {strings.results.notMeasured}
                  </span>
                ) : (
                  <>
                    <div className="bg-muted h-2 flex-1 rounded-full">
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
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{strings.results.strengths}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {strengths.map((slug) => (
              <Badge key={slug}>{nameOf.get(slug) ?? slug}</Badge>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{strings.results.blindSpots}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {blindSpots.map((slug) => (
              <Badge key={slug} variant="outline">
                {nameOf.get(slug) ?? slug}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{strings.results.confidence}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <p className="font-medium capitalize">{confidence.level}</p>
          {confidence.level === "low" && (
            <p className="text-muted-foreground text-sm">
              {strings.results.confidenceLow}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

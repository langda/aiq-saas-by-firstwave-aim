import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as assessmentService from "@/features/assessment/server/service";
import { AchievementStars } from "@/features/results/components/achievement-stars";
import { ProgressChart } from "@/features/results/components/progress-chart";
import * as resultsDb from "@/features/results/server/db";
import { getAchievement } from "@/lib/achievements";
import { getAuthContext } from "@/lib/auth/context";
import { strings } from "@/lib/strings";

export const metadata: Metadata = { title: strings.dashboard.title };

/** The identity home (UX Phase D): who you are first, the journey second. */
export default async function DashboardPage() {
  const s = strings.dashboard;
  const results = await resultsDb.listResultsForUser();

  if (results.length === 0) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-semibold">{s.emptyTitle}</h1>
        <p className="text-muted-foreground max-w-md">{s.emptyBody}</p>
        <Button nativeButton={false} render={<Link href="/assessment/aiq" />}>
          {s.emptyAction}
        </Button>
      </section>
    );
  }

  const [personaMeta, ctx] = await Promise.all([
    resultsDb.getPersonaMeta(),
    getAuthContext(),
  ]);
  // Newest result is the default profile (Decision 7).
  const latest = results[0];
  const latestPersona = personaMeta.get(latest.persona_id);
  const achievement = getAchievement(latest.overall_score);
  const retakeAt = ctx
    ? await assessmentService.getRetakeGate(ctx, "aiq")
    : null;

  const history = [...results].reverse().map((r) => ({
    date: new Date(r.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    score: r.overall_score,
  }));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      {/* Identity hero */}
      <Card className="from-primary/15 via-primary/5 border-none bg-gradient-to-br to-transparent">
        <CardContent className="flex items-center gap-5 py-8">
          {latestPersona?.artworkUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={latestPersona.artworkUrl}
              alt=""
              aria-hidden
              className="size-20 shrink-0 rounded-2xl shadow-md md:size-24"
            />
          )}
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
              {s.currentProfile}
            </p>
            <p className="text-3xl font-semibold tracking-tight">
              {latestPersona?.name ?? "—"}
            </p>
            <AchievementStars level={achievement} />
            <div className="pt-1">
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href={`/results/${latest.session_id}`} />}
              >
                {s.viewResults}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* The journey */}
      <Card>
        <CardHeader>
          <CardTitle>{s.history}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ProgressChart data={history} />
          <ul className="flex flex-col divide-y">
            {results.map((result) => {
              const persona = personaMeta.get(result.persona_id);
              return (
                <li
                  key={result.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <Link
                    href={`/results/${result.session_id}`}
                    className="flex items-center gap-3 hover:underline"
                  >
                    {persona?.artworkUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={persona.artworkUrl}
                        alt=""
                        aria-hidden
                        className="size-8 rounded-lg"
                      />
                    )}
                    <span className="text-sm">
                      {persona?.name ?? "—"} ·{" "}
                      {new Date(result.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </Link>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {getAchievement(result.overall_score).name}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="text-muted-foreground text-sm">{s.historyHint}</p>
          {retakeAt ? (
            <p className="text-muted-foreground text-sm">
              {s.retakeLockedPrefix}{" "}
              {new Date(retakeAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              .
            </p>
          ) : (
            <div>
              <Button
                nativeButton={false}
                render={<Link href="/assessment/aiq" />}
              >
                {s.retakeAction}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressChart } from "@/features/results/components/progress-chart";
import * as resultsDb from "@/features/results/server/db";
import * as assessmentService from "@/features/assessment/server/service";
import { getAuthContext } from "@/lib/auth/context";
import { strings } from "@/lib/strings";

export const metadata: Metadata = { title: strings.dashboard.title };

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

  const [personaNames, ctx] = await Promise.all([
    resultsDb.getPersonaNames(),
    getAuthContext(),
  ]);
  // Newest result is the default profile (Decision 7).
  const latest = results[0];
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
      <h1 className="text-2xl font-semibold">{s.title}</h1>

      <Card className="from-primary/10 via-primary/5 border-none bg-gradient-to-br to-transparent">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            {s.currentProfile}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-3xl font-semibold">
              {personaNames.get(latest.persona_id) ?? "—"}
            </p>
            <p className="text-2xl font-semibold tabular-nums">
              {latest.overall_score}
              <span className="text-muted-foreground text-base font-normal">
                {" "}
                / 100
              </span>
            </p>
          </div>
          <div>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={`/results/${latest.session_id}`} />}
            >
              {s.viewResults}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{s.history}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ProgressChart data={history} />
          <ul className="flex flex-col divide-y">
            {results.map((result) => (
              <li
                key={result.id}
                className="flex items-center justify-between py-3"
              >
                <Link
                  href={`/results/${result.session_id}`}
                  className="text-sm hover:underline"
                >
                  {personaNames.get(result.persona_id) ?? "—"} ·{" "}
                  {new Date(result.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Link>
                <span className="text-sm tabular-nums">
                  {result.overall_score}
                </span>
              </li>
            ))}
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

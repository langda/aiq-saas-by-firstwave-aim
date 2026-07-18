import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as analytics from "@/features/analytics/server/service";
import { getAuthContext } from "@/lib/auth/context";
import { strings } from "@/lib/strings";

export const metadata: Metadata = { title: strings.admin.analytics.title };

function Bar({ value, max }: { value: number; max: number }) {
  return (
    <div className="bg-muted h-2 w-full max-w-48 overflow-hidden rounded-full">
      <div
        className="bg-primary h-2 rounded-full"
        style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
      />
    </div>
  );
}

export default async function AnalyticsPage() {
  const ctx = await getAuthContext();
  if (!ctx) notFound();
  const overview = await analytics.getOverview(ctx);
  const s = strings.admin.analytics;

  const tiles = [
    { label: s.started, value: overview.funnel.started },
    { label: s.completed, value: overview.funnel.completed },
    { label: s.completionRate, value: `${overview.funnel.completionRate}%` },
    { label: s.inProgress, value: overview.funnel.inProgress },
  ];
  const maxPersona = Math.max(
    1,
    ...overview.personaDistribution.map(([, n]) => n),
  );
  const maxLevel = Math.max(1, ...overview.levelDistribution.map(([, n]) => n));

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{s.title}</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <CardContent className="flex flex-col gap-1 py-5">
              <p className="text-3xl font-semibold tabular-nums">
                {tile.value}
              </p>
              <p className="text-muted-foreground text-sm">{tile.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{s.personaDistribution}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {overview.personaDistribution.map(([name, count]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-sm">{name}</span>
                <Bar value={count} max={maxPersona} />
                <span className="text-sm tabular-nums">{count}</span>
              </div>
            ))}
            {overview.personaDistribution.length === 0 && (
              <p className="text-muted-foreground text-sm">
                {strings.admin.common.empty}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{s.levelDistribution}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {overview.levelDistribution.map(([name, count]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-sm">{name}</span>
                <Bar value={count} max={maxLevel} />
                <span className="text-sm tabular-nums">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{s.questionStats}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {overview.questionStats.map((question) => {
            const maxChosen = Math.max(
              1,
              ...question.options.map((o) => o.chosen),
            );
            return (
              <div key={question.questionId} className="flex flex-col gap-2">
                <p className="font-medium">
                  {question.title}{" "}
                  <span className="text-muted-foreground text-sm font-normal">
                    · {question.responses} {s.answers}
                    {question.averageTimeMs != null &&
                      ` · ${(question.averageTimeMs / 1000).toFixed(1)}s ${s.avgTime}`}
                  </span>
                </p>
                {question.options.map((option) => (
                  <div
                    key={option.optionId}
                    className="flex items-center gap-3"
                  >
                    <span
                      className="text-muted-foreground w-72 shrink-0 truncate text-xs"
                      title={option.content}
                    >
                      {option.content}
                    </span>
                    <Bar value={option.chosen} max={maxChosen} />
                    <span className="text-xs tabular-nums">
                      {option.chosen}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
}

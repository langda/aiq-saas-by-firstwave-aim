"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

/** Themed radar over measured competencies (null = unmeasured, excluded). */
export function CompetencyRadar({
  data,
}: {
  data: Array<{ name: string; score: number | null }>;
}) {
  const measured = data.filter(
    (d): d is { name: string; score: number } => d.score !== null,
  );
  if (measured.length < 3) return null; // a radar needs shape to be honest

  return (
    <div className="h-72 w-full md:h-80" aria-hidden>
      <ResponsiveContainer>
        <RadarChart data={measured} outerRadius="72%">
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          />
          <Radar
            dataKey="score"
            stroke="var(--primary)"
            fill="var(--primary)"
            fillOpacity={0.25}
            strokeWidth={2}
            isAnimationActive
            animationDuration={700}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

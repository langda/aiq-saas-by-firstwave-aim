"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

/** Overall score over time (Decision 7: history preserved, progress shown). */
export function ProgressChart({
  data,
}: {
  data: Array<{ date: string; score: number }>;
}) {
  if (data.length < 2) return null; // a single point is not a trend

  return (
    <div className="h-48 w-full" aria-hidden>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: -24 }}
        >
          <CartesianGrid
            stroke="var(--border)"
            strokeDasharray="4 4"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={{ fill: "var(--primary)", r: 3 }}
            isAnimationActive
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

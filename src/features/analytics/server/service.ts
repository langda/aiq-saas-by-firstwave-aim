import "server-only";

import { canAccessAdminArea } from "@/core/authz";
import type { AuthContext } from "@/core/types";
import { getAchievement } from "@/lib/achievements";

import * as db from "./db";

export class AnalyticsError extends Error {
  constructor(public readonly code: "forbidden") {
    super("Not allowed");
  }
}

/** Everything the admin analytics page shows, in one authorized call. */
export async function getOverview(ctx: AuthContext) {
  if (!canAccessAdminArea(ctx)) throw new AnalyticsError("forbidden");

  const [events, sessions, distributions, questionStats] = await Promise.all([
    db.getEventCounts(),
    db.getSessionStatusCounts(),
    db.getResultDistributions(),
    db.getQuestionStats(),
  ]);

  const started = events.get("assessment_started") ?? 0;
  const completed = events.get("assessment_completed") ?? 0;

  const personaCounts = new Map<string, number>();
  const levelCounts = new Map<string, number>();
  for (const row of distributions.rows) {
    personaCounts.set(
      row.personaName,
      (personaCounts.get(row.personaName) ?? 0) + 1,
    );
    const level = getAchievement(row.overallScore).name;
    levelCounts.set(level, (levelCounts.get(level) ?? 0) + 1);
  }

  return {
    funnel: {
      started,
      completed,
      completionRate: started > 0 ? Math.round((completed / started) * 100) : 0,
      inProgress: sessions.get("in_progress") ?? 0,
    },
    totalResults: distributions.rows.length,
    personaDistribution: [...personaCounts.entries()].sort(
      (a, b) => b[1] - a[1],
    ),
    levelDistribution: [...levelCounts.entries()].sort((a, b) => b[1] - a[1]),
    questionStats: questionStats.sort((a, b) => b.responses - a.responses),
  };
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import type { RecommendedAction } from "@/lib/ai/schemas";
import { strings } from "@/lib/strings";

const POLL_INTERVAL_MS = 2500;
const MAX_POLLS = 12; // ~30s — generation is capped at 20s + fallback

/**
 * Recommendations panel. Server-rendered content; while generation is
 * pending, this client component politely refreshes the route until the
 * actions land (or gives up into the graceful unavailable state).
 */
export function RecommendationsPanel({
  status,
  actions,
}: {
  status: string;
  actions: RecommendedAction[] | null;
}) {
  const router = useRouter();
  const polls = useRef(0);
  const s = strings.recommendations;

  useEffect(() => {
    if (status !== "pending" || polls.current >= MAX_POLLS) return;
    const timer = setTimeout(() => {
      polls.current += 1;
      router.refresh();
    }, POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [status, router]);

  if (actions) {
    return (
      <ol className="flex flex-col gap-5">
        {actions.map((action, index) => (
          <li key={index} className="flex gap-4">
            <span
              aria-hidden
              className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
            >
              {index + 1}
            </span>
            <div className="flex flex-col gap-1.5">
              <p className="font-medium">{action.title}</p>
              <p className="text-muted-foreground text-sm">
                <span className="text-foreground/70 font-medium">
                  {s.whyLabel}:
                </span>{" "}
                {action.why}
              </p>
              <p className="text-muted-foreground text-sm">
                <span className="text-foreground/70 font-medium">
                  {s.howLabel}:
                </span>{" "}
                {action.how}
              </p>
            </div>
          </li>
        ))}
      </ol>
    );
  }

  if (status === "pending") {
    return (
      <div className="flex items-center gap-3" role="status">
        <span
          aria-hidden
          className="border-primary size-4 animate-spin rounded-full border-2 border-t-transparent"
        />
        <p className="text-muted-foreground text-sm">{s.generating}</p>
      </div>
    );
  }

  return <p className="text-muted-foreground text-sm">{s.unavailable}</p>;
}

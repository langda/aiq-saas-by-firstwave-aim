import type { Metadata } from "next";

import { strings } from "@/lib/strings";

export const metadata: Metadata = { title: strings.brand.tagline };

/**
 * PUBLIC route (Decision 1: anonymous-first). The assessment runner lands
 * here in Milestone 1; the route exists now so the URL shape, middleware
 * behavior, and landing CTA are final from day one.
 */
export default function AssessmentPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-2xl font-semibold">
        {strings.assessment.placeholderTitle}
      </h1>
      <p className="text-muted-foreground max-w-md">
        {strings.assessment.placeholderBody}
      </p>
    </main>
  );
}

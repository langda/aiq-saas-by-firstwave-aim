import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { PersonaShowcase } from "@/components/shared/persona-showcase";
import { AssessmentRunner } from "@/features/assessment/components/assessment-runner";
import { startAssessment } from "@/features/assessment/server/actions";
import * as assessmentService from "@/features/assessment/server/service";
import { ServiceError } from "@/features/assessment/server/service";
import { getAuthContext } from "@/lib/auth/context";
import { strings } from "@/lib/strings";

export const metadata: Metadata = { title: strings.brand.tagline };

/**
 * PUBLIC route (Decision 1: anonymous-first). No session → intro screen whose
 * Start action transparently creates an anonymous identity. Active session →
 * the runner, resumable at any time.
 */
export default async function AssessmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;

  const ctx = await getAuthContext();

  let runnerState = null;
  let retakeAt: string | null = null;
  if (ctx) {
    try {
      runnerState = await assessmentService.getRunnerState(ctx, slug);
      if (!runnerState)
        retakeAt = await assessmentService.getRetakeGate(ctx, slug);
    } catch (e) {
      if (e instanceof ServiceError && e.code === "not_found") notFound();
      throw e;
    }
  }

  return (
    <main className="flex min-h-dvh flex-col px-6 py-10">
      <div className="mx-auto mb-10 w-full max-w-xl">
        <Link href="/" className="font-semibold tracking-tight">
          {strings.brand.name}
        </Link>
      </div>
      {runnerState ? (
        <AssessmentRunner state={runnerState} />
      ) : retakeAt ? (
        <section className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            {strings.retake.lockedTitle}
          </h1>
          <p className="text-muted-foreground">
            {strings.retake.lockedBody}{" "}
            {new Date(retakeAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            .
          </p>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            {strings.retake.viewResults}
          </Button>
        </section>
      ) : (
        <section className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            {strings.landing.heroTitle}
          </h1>
          <PersonaShowcase compact />
          <p className="text-muted-foreground max-w-md">
            {strings.assessment.introNote}
          </p>
          <p className="text-muted-foreground text-sm">
            {strings.assessment.introMeta}
          </p>
          {error === "start" && (
            <p role="alert" className="text-destructive text-sm">
              {strings.assessment.startError}
            </p>
          )}
          <form action={startAssessment}>
            <input type="hidden" name="slug" value={slug} />
            <Button size="lg" type="submit">
              {strings.assessment.start}
            </Button>
          </form>
        </section>
      )}
    </main>
  );
}

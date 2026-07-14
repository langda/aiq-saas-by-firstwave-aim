import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

export const metadata: Metadata = { title: strings.dashboard.title };

export default function DashboardPage() {
  // Real data arrives with Milestone 1 (sessions + results). Until then the
  // dashboard renders its empty state — which is a required state anyway.
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-semibold">{strings.dashboard.emptyTitle}</h1>
      <p className="text-muted-foreground max-w-md">
        {strings.dashboard.emptyBody}
      </p>
      <Button nativeButton={false} render={<Link href="/assessment/aiq" />}>
        {strings.dashboard.emptyAction}
      </Button>
    </section>
  );
}

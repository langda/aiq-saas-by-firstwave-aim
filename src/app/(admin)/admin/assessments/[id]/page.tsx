import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { AssessmentBuilderForm } from "@/features/questions/components/assessment-builder-form";
import * as service from "@/features/questions/server/service";
import { getAuthContext } from "@/lib/auth/context";
import { strings } from "@/lib/strings";

export const metadata: Metadata = { title: strings.admin.builder.title };

export default async function AssessmentBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const ctx = await getAuthContext();
  if (!ctx) notFound();

  const { assessment, published, selectedIds } =
    await service.getAssessmentBuilder(ctx, id);

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">
        {strings.admin.builder.title}{" "}
        <span className="text-muted-foreground text-base">
          ({assessment.status})
        </span>
      </h1>
      <AssessmentBuilderForm
        assessment={assessment}
        published={published}
        selectedIds={selectedIds}
      />
    </section>
  );
}

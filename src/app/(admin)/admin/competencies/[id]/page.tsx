import { notFound } from "next/navigation";
import { z } from "zod";

import { TaxonomyForm } from "@/features/taxonomy/components/taxonomy-form";
import * as db from "@/features/taxonomy/server/db";
import { strings } from "@/lib/strings";

export const metadata = { title: strings.admin.nav.competencies };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const item = await db.getItem("competency", id);
  if (!item) notFound();
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{item.name}</h1>
      <TaxonomyForm kind="competency" item={item} />
    </section>
  );
}

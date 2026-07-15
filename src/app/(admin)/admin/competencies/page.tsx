import { TaxonomyList } from "@/features/taxonomy/components/taxonomy-list";
import { strings } from "@/lib/strings";

export const metadata = { title: strings.admin.nav.competencies };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <TaxonomyList
      kind="competency"
      title={strings.admin.nav.competencies}
      basePath="/admin/competencies"
      error={error}
    />
  );
}

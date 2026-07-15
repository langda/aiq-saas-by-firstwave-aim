import { TaxonomyList } from "@/features/taxonomy/components/taxonomy-list";
import { strings } from "@/lib/strings";

export const metadata = { title: strings.admin.nav.personas };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <TaxonomyList
      kind="persona"
      title={strings.admin.nav.personas}
      basePath="/admin/personas"
      error={error}
    />
  );
}

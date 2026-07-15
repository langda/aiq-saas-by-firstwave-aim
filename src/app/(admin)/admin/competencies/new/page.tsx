import { TaxonomyForm } from "@/features/taxonomy/components/taxonomy-form";
import { strings } from "@/lib/strings";

export const metadata = { title: strings.admin.nav.competencies };

export default function Page() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">
        {strings.admin.common.newItem} — {strings.admin.nav.competencies}
      </h1>
      <TaxonomyForm kind="competency" />
    </section>
  );
}

import type { Metadata } from "next";

import { strings } from "@/lib/strings";

export const metadata: Metadata = { title: strings.admin.title };

export default function AdminDashboardPage() {
  // Thin-admin CRUD (questions, competencies, personas) lands in Milestone 2.
  return (
    <section>
      <h1 className="text-2xl font-semibold">{strings.admin.title}</h1>
    </section>
  );
}

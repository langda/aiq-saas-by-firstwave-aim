import Link from "next/link";
import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { strings } from "@/lib/strings";

export const metadata: Metadata = { title: strings.admin.title };

const sections = [
  { href: "/admin/questions", label: strings.admin.nav.questions },
  { href: "/admin/competencies", label: strings.admin.nav.competencies },
  { href: "/admin/personas", label: strings.admin.nav.personas },
  { href: "/admin/assessments", label: strings.admin.nav.assessments },
  { href: "/admin/analytics", label: strings.admin.nav.analytics },
  { href: "/admin/scoring", label: strings.admin.nav.scoring },
];

export default function AdminDashboardPage() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{strings.admin.title}</h1>
        <p className="text-muted-foreground">
          {strings.admin.dashboard.subtitle}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-base">{section.label}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                {strings.admin.common.edit} →
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

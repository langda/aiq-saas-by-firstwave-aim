import Link from "next/link";
import { notFound } from "next/navigation";

import { canAccessAdminArea } from "@/core/authz";
import { getAuthContext } from "@/lib/auth/context";
import { strings } from "@/lib/strings";

const nav = [
  { href: "/admin/questions", label: strings.admin.nav.questions },
  { href: "/admin/competencies", label: strings.admin.nav.competencies },
  { href: "/admin/personas", label: strings.admin.nav.personas },
  { href: "/admin/assessments", label: strings.admin.nav.assessments },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getAuthContext();
  // 404, not 403 — don't advertise the admin surface (ARCHITECTURE §6).
  if (!ctx || !canAccessAdminArea(ctx)) notFound();

  return (
    <>
      <header className="flex items-center gap-8 border-b px-6 py-4 md:px-10">
        <Link href="/admin" className="text-lg font-semibold tracking-tight">
          {strings.brand.name} {strings.admin.title}
        </Link>
        <nav className="flex gap-4 text-sm">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex flex-1 flex-col px-6 py-8 md:px-10">
        {children}
      </main>
    </>
  );
}

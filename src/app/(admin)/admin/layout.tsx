import { notFound } from "next/navigation";

import { canAccessAdminArea } from "@/core/authz";
import { getAuthContext } from "@/lib/auth/context";
import { strings } from "@/lib/strings";

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
      <header className="border-b px-6 py-4 md:px-10">
        <span className="text-lg font-semibold tracking-tight">
          {strings.brand.name} {strings.admin.title}
        </span>
      </header>
      <main className="flex flex-1 flex-col px-6 py-8 md:px-10">
        {children}
      </main>
    </>
  );
}

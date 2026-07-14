import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { canViewOwnResults } from "@/core/authz";
import { getAuthContext } from "@/lib/auth/context";
import { strings } from "@/lib/strings";
import { signOut } from "@/features/auth/server/actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already gates coarsely; this is the authoritative check.
  const ctx = await getAuthContext();
  if (!ctx || !canViewOwnResults(ctx)) redirect("/login");

  return (
    <>
      <header className="flex items-center justify-between border-b px-6 py-4 md:px-10">
        <Link
          href="/dashboard"
          className="text-lg font-semibold tracking-tight"
        >
          {strings.brand.name}
        </Link>
        <form action={signOut}>
          <Button variant="ghost" type="submit">
            {strings.auth.signOut}
          </Button>
        </form>
      </header>
      <main className="flex flex-1 flex-col px-6 py-8 md:px-10">
        {children}
      </main>
    </>
  );
}

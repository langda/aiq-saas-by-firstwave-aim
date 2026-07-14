import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthForm } from "@/features/auth/components/auth-form";
import {
  convertAnonymousAccount,
  finishClaim,
} from "@/features/auth/server/actions";
import { getAuthContext } from "@/lib/auth/context";
import { strings } from "@/lib/strings";

export const metadata: Metadata = { title: strings.claim.title };

/**
 * The results gate (Decision 1). Anonymous visitors convert in place (same
 * user id — data already attached); signed-in permanent users complete the
 * claim (token invalidation / cross-account re-parent) and continue.
 */
export default async function ClaimPage() {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login?next=/claim");

  if (!ctx.isAnonymous) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{strings.claim.continueTitle}</CardTitle>
            <CardDescription>{strings.claim.continueSubtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={finishClaim}>
              <Button type="submit" className="w-full">
                {strings.claim.continueAction}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{strings.claim.title}</CardTitle>
          <CardDescription>{strings.claim.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <AuthForm
            action={convertAnonymousAccount}
            submitLabel={strings.claim.convertAction}
            fields={[
              {
                name: "fullName",
                label: strings.auth.fullNameLabel,
                type: "text",
                autoComplete: "name",
              },
              {
                name: "email",
                label: strings.auth.emailLabel,
                type: "email",
                autoComplete: "email",
              },
              {
                name: "password",
                label: strings.auth.passwordLabel,
                type: "password",
                autoComplete: "new-password",
              },
            ]}
          />
          <p className="text-center text-sm">
            <Link href="/login?next=/claim" className="hover:underline">
              {strings.claim.haveAccount}
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

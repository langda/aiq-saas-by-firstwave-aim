import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthForm } from "@/features/auth/components/auth-form";
import { updatePassword } from "@/features/auth/server/actions";
import { getAuthContext } from "@/lib/auth/context";
import { strings } from "@/lib/strings";

export const metadata: Metadata = { title: strings.auth.updateTitle };

/**
 * Password update — the destination of the recovery link. /auth/confirm has
 * already exchanged the emailed token for a session; without one, the link
 * was invalid/expired and the user is sent back to request a fresh one.
 */
export default async function UpdatePasswordPage() {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login?error=link");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{strings.auth.updateTitle}</CardTitle>
        <CardDescription>{strings.auth.updateSubtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <AuthForm
          action={updatePassword}
          submitLabel={strings.auth.updateAction}
          fields={[
            {
              name: "password",
              label: strings.auth.newPasswordLabel,
              type: "password",
              autoComplete: "new-password",
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}

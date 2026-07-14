import Link from "next/link";
import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthForm } from "@/features/auth/components/auth-form";
import { requestPasswordReset } from "@/features/auth/server/actions";
import { strings } from "@/lib/strings";

export const metadata: Metadata = { title: strings.auth.resetTitle };

export default function ResetPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{strings.auth.resetTitle}</CardTitle>
        <CardDescription>{strings.auth.resetSubtitle}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <AuthForm
          action={requestPasswordReset}
          submitLabel={strings.auth.resetAction}
          successMessage={strings.auth.resetSent}
          fields={[
            {
              name: "email",
              label: strings.auth.emailLabel,
              type: "email",
              autoComplete: "email",
            },
          ]}
        />
        <p className="text-center text-sm">
          <Link href="/login" className="hover:underline">
            {strings.auth.toLogin}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

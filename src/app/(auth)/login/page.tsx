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
import { login } from "@/features/auth/server/actions";
import { strings } from "@/lib/strings";

export const metadata: Metadata = { title: strings.auth.loginTitle };

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{strings.auth.loginTitle}</CardTitle>
        <CardDescription>{strings.auth.loginSubtitle}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <AuthForm
          action={login}
          submitLabel={strings.auth.loginAction}
          fields={[
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
              autoComplete: "current-password",
            },
          ]}
        />
        <div className="flex flex-col gap-1 text-center text-sm">
          <Link
            href="/reset-password"
            className="text-muted-foreground hover:underline"
          >
            {strings.auth.toReset}
          </Link>
          <Link href="/signup" className="hover:underline">
            {strings.auth.toSignup}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

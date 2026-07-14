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
import { signup } from "@/features/auth/server/actions";
import { strings } from "@/lib/strings";

export const metadata: Metadata = { title: strings.auth.signupTitle };

export default function SignupPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{strings.auth.signupTitle}</CardTitle>
        <CardDescription>{strings.auth.signupSubtitle}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <AuthForm
          action={signup}
          submitLabel={strings.auth.signupAction}
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
          <Link href="/login" className="hover:underline">
            {strings.auth.toLogin}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

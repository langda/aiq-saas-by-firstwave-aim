import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as certificates from "@/features/certificates/server/service";
import { strings } from "@/lib/strings";

/**
 * PUBLIC certificate verification (Decision 6): name, persona, date, status.
 * Never the score, never the competency breakdown. This page is the QR
 * target and the share-link destination — it doubles as an acquisition
 * surface, hence the CTA.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const verification = await certificates.getPublicVerification(code);
  // Revoked or unknown certificates disclose nothing — not even in metadata.
  if (!verification || verification.status !== "valid")
    return { title: strings.verify.title };
  return {
    title: `${verification.holderName ?? "AIQ"} — ${verification.personaName}`,
    description: `${strings.verify.valid}: ${verification.assessmentTitle}`,
  };
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const verification = await certificates.getPublicVerification(code);
  const s = strings.verify;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 p-6">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        {strings.brand.name}
      </Link>

      {!verification ? (
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>{s.notFoundTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{s.notFoundBody}</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-col items-center gap-2 text-center">
            <Badge
              variant={
                verification.status === "valid" ? "default" : "destructive"
              }
            >
              {verification.status === "valid" ? s.valid : s.revoked}
            </Badge>
            <CardTitle className="text-sm font-normal">
              {strings.verify.title}
            </CardTitle>
          </CardHeader>
          {verification.status === "valid" && (
            <CardContent className="flex flex-col gap-4">
              <div className="from-primary/10 via-primary/5 rounded-xl bg-gradient-to-br to-transparent p-6 text-center">
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  {s.holder}
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {verification.holderName ?? "—"}
                </p>
                <p className="text-primary mt-3 text-lg font-medium">
                  {verification.personaName}
                </p>
              </div>
              <dl className="text-sm">
                <div className="flex justify-between border-b py-2">
                  <dt className="text-muted-foreground">{s.assessment}</dt>
                  <dd>{verification.assessmentTitle}</dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-muted-foreground">{s.issued}</dt>
                  <dd>
                    {new Date(verification.issuedAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          )}
        </Card>
      )}

      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href="/assessment/aiq" />}
      >
        {s.cta}
      </Button>
    </main>
  );
}

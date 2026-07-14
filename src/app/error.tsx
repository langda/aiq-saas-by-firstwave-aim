"use client";

import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

export default function ErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">{strings.errors.genericTitle}</h1>
      <p className="text-muted-foreground">{strings.errors.genericBody}</p>
      <Button onClick={reset}>{strings.errors.retry}</Button>
    </main>
  );
}

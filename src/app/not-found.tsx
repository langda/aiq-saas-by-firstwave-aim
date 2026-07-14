import Link from "next/link";

import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">{strings.errors.notFoundTitle}</h1>
      <p className="text-muted-foreground">{strings.errors.notFoundBody}</p>
      <Button nativeButton={false} render={<Link href="/" />}>
        {strings.errors.goHome}
      </Button>
    </main>
  );
}

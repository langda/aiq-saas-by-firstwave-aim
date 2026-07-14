import Link from "next/link";

import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {strings.brand.name}
        </Link>
        <nav className="flex items-center gap-2">
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            {strings.landing.ctaSecondary}
          </Button>
          <Button nativeButton={false} render={<Link href="/assessment/aiq" />}>
            {strings.landing.cta}
          </Button>
        </nav>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="text-muted-foreground px-6 py-8 text-center text-sm md:px-10">
        {strings.brand.name} — {strings.brand.tagline}
      </footer>
    </>
  );
}

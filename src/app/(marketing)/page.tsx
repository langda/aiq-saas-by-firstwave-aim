import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PersonaShowcase } from "@/components/shared/persona-showcase";
import { strings } from "@/lib/strings";

export default function LandingPage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
        {strings.landing.heroTitle}
      </h1>
      <p className="text-muted-foreground max-w-xl text-lg text-balance">
        {strings.landing.heroSubtitle}
      </p>
      <div className="flex flex-col items-center gap-3">
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/assessment/aiq" />}
        >
          {strings.landing.cta}
        </Button>
        <p className="text-muted-foreground text-sm">
          {strings.landing.noSignupNote}
        </p>
      </div>
      <div className="mt-10">
        <PersonaShowcase />
      </div>
    </section>
  );
}

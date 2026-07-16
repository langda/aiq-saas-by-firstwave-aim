import { personaShowcase } from "@/lib/persona-content";
import { strings } from "@/lib/strings";

/** "Which one are you?" — the curiosity hook on public surfaces. */
export function PersonaShowcase({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4">
      {!compact && (
        <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
          {strings.landing.whichOne}
        </p>
      )}
      <ul className="flex flex-wrap items-start justify-center gap-5 md:gap-8">
        {personaShowcase.map((persona) => (
          <li
            key={persona.slug}
            className="flex w-16 flex-col items-center gap-2 md:w-20"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={persona.artwork}
              alt=""
              aria-hidden
              className={`rounded-2xl shadow-sm transition-transform hover:scale-105 ${
                compact ? "size-12 md:size-14" : "size-16 md:size-20"
              }`}
            />
            {!compact && (
              <span className="text-muted-foreground text-center text-xs leading-tight">
                {persona.name}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

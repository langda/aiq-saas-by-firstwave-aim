import type { AchievementLevel } from "@/lib/achievements";

/** Star row + level name. Server-renderable; glow reserved for Apex. */
export function AchievementStars({
  level,
  size = "md",
}: {
  level: AchievementLevel;
  size?: "md" | "lg";
}) {
  const starSize = size === "lg" ? "size-7" : "size-5";
  return (
    <div
      className="flex items-center gap-3"
      role="img"
      aria-label={`Achievement level: ${level.name}, ${level.stars} of 5 stars`}
    >
      <div className="flex gap-1" aria-hidden>
        {[0, 1, 2, 3, 4].map((index) => {
          const filled = index < level.stars;
          const apex = level.glow && index === 4;
          return (
            <svg
              key={index}
              viewBox="0 0 24 24"
              className={`${starSize} ${
                filled
                  ? apex
                    ? "text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]"
                    : "text-primary"
                  : "text-border"
              }`}
              fill="currentColor"
            >
              <path d="M12 2l2.9 6.26 6.6.7-4.9 4.5 1.35 6.54L12 16.9 6.05 20l1.35-6.54-4.9-4.5 6.6-.7L12 2z" />
            </svg>
          );
        })}
      </div>
      <span className="text-lg font-semibold tracking-wide">{level.name}</span>
    </div>
  );
}

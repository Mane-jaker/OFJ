"use client";

import { cn } from "@/lib/utils";

interface FilterChipsProps {
  platforms: string[];
  activePlatforms: string[];
  onToggle: (platform: string) => void;
}

export function FilterChips({
  platforms,
  activePlatforms,
  onToggle,
}: FilterChipsProps) {
  if (platforms.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-sm text-[var(--color-muted)]">Filter:</span>

      {platforms.map((platform) => {
        const isActive = activePlatforms.includes(platform);

        return (
          <button
            key={platform}
            type="button"
            onClick={() => onToggle(platform)}
            className={cn(
              "rounded-[10px] border px-3 py-1.5 text-xs font-medium transition-all capitalize",
              isActive
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-fg)]",
            )}
          >
            {platform}
          </button>
        );
      })}
    </div>
  );
}

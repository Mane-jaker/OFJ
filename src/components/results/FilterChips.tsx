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
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-[var(--color-muted)]">Filtrar:</span>

      {platforms.map((platform) => {
        const isActive = activePlatforms.includes(platform);

        return (
          <button
            key={platform}
            type="button"
            onClick={() => onToggle(platform)}
            className={cn("chip capitalize", isActive && "chip-active")}
          >
            {platform}
          </button>
        );
      })}
    </div>
  );
}

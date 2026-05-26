"use client";

import { cn } from "@/lib/utils";

const PLATFORMS = [
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: (
      <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    id: "indeed",
    name: "Indeed",
    icon: (
      <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C9.086 0 6.72 2.366 6.72 5.28c0 2.914 2.366 5.28 5.28 5.28s5.28-2.366 5.28-5.28C17.28 2.366 14.914 0 12 0zm6.72 15.36c-1.728 0-3.12 1.392-3.12 3.12 0 1.728 1.392 3.12 3.12 3.12s3.12-1.392 3.12-3.12c0-1.728-1.392-3.12-3.12-3.12zM5.28 15.36c-1.728 0-3.12 1.392-3.12 3.12 0 1.728 1.392 3.12 3.12 3.12s3.12-1.392 3.12-3.12c0-1.728-1.392-3.12-3.12-3.12z" />
      </svg>
    ),
  },
  {
    id: "occ",
    name: "OCC Mundial",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
];

interface PlatformSelectorProps {
  platforms: string[];
  onChange: (platforms: string[]) => void;
}

export function PlatformSelector({
  platforms,
  onChange,
}: PlatformSelectorProps) {
  function togglePlatform(id: string) {
    if (platforms.includes(id)) {
      onChange(platforms.filter((p) => p !== id));
    } else {
      onChange([...platforms, id]);
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Select Platforms</h3>

      <div className="grid gap-3 sm:grid-cols-3">
        {PLATFORMS.map((platform) => {
          const isSelected = platforms.includes(platform.id);

          return (
            <button
              key={platform.id}
              type="button"
              onClick={() => togglePlatform(platform.id)}
              className={cn(
                "flex flex-col items-center gap-3 rounded-[16px] border-2 p-6 transition-all",
                isSelected
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
                  : "border-[var(--color-border)] hover:border-[var(--color-muted)]",
              )}
            >
              <div
                className={cn(
                  "transition-colors",
                  isSelected
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--color-muted)]",
                )}
              >
                {platform.icon}
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-[var(--color-fg)]" : "text-[var(--color-muted)]",
                )}
              >
                {platform.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { toggleJobFavorite, markJobViewed } from "@/server/agent/actions";
import { CVPreview } from "@/components/cv/CVPreview";

interface JobCardProps {
  id: string;
  platform: string;
  title: string;
  company: string;
  description?: string | null;
  url?: string | null;
  location?: string | null;
  salaryRange?: string | null;
  relevanceScore?: number | null;
  isViewed: boolean;
  isFavorite: boolean;
  onViewed?: (jobId: string) => void;
  onFavorite?: (jobId: string, isFavorite: boolean) => void;
}

export function JobCard({
  id,
  platform,
  title,
  company,
  description,
  url,
  location,
  salaryRange,
  relevanceScore,
  isViewed: initialViewed,
  isFavorite: initialFavorite,
  onViewed,
  onFavorite,
}: JobCardProps) {
  const [viewed, setViewed] = useState(initialViewed);
  const [favorite, setFavorite] = useState(initialFavorite);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  function handleView() {
    if (!url) return;

    window.open(url, "_blank", "noopener,noreferrer");

    if (!viewed) {
      setViewed(true);
      markJobViewed(id);
      onViewed?.(id);
    }
  }

  async function handleToggleFavorite() {
    if (isTogglingFavorite) return;
    setIsTogglingFavorite(true);

    try {
      const result = await toggleJobFavorite(id);
      if (result.success) {
        setFavorite(result.isFavorite);
        onFavorite?.(id, result.isFavorite);
      }
    } finally {
      setIsTogglingFavorite(false);
    }
  }

  const platformColors: Record<string, string> = {
    linkedin: "bg-[#0A66C2]/10 text-[#0A66C2]",
    indeed: "bg-[#003A9B]/10 text-[#003A9B]",
    occ: "bg-[#E67E22]/10 text-[#E67E22]",
  };

  return (
    <div
      className={cn(
        "rounded-[14px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-opacity",
        viewed && "opacity-60",
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "rounded-[8px] px-2.5 py-1 text-xs font-medium capitalize",
              platformColors[platform] ??
                "bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
            )}
          >
            {platform}
          </span>

          {relevanceScore !== null && relevanceScore !== undefined && (
            <span
              className={cn(
                "rounded-[8px] px-2.5 py-1 text-xs font-medium",
                relevanceScore > 80
                  ? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
                  : relevanceScore >= 50
                    ? "bg-[var(--color-warning-bg)] text-[var(--color-warning)]"
                    : "bg-[var(--color-chip-bg)] text-[var(--color-muted)]",
              )}
            >
              {Math.round(relevanceScore)}% match
            </span>
          )}

          {viewed && (
            <span className="rounded-[8px] bg-[var(--color-chip-bg)] px-2.5 py-1 text-xs font-medium text-[var(--color-muted)]">
              Visto
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleToggleFavorite}
          disabled={isTogglingFavorite}
          className={cn(
            "transition-colors",
            favorite
              ? "text-[var(--color-accent)]"
              : "text-[var(--color-muted)] hover:text-[var(--color-fg)]",
          )}
          aria-label={favorite ? "Remove favorite" : "Add favorite"}
        >
          <svg
            className="h-5 w-5"
            fill={favorite ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={favorite ? 0 : 1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
            />
          </svg>
        </button>
      </div>

      <h3 className="mb-1 text-lg font-semibold">{title}</h3>
      <p className="mb-3 text-sm text-[var(--color-muted)]">{company}</p>

      {(location || salaryRange) && (
        <div className="mb-3 flex flex-wrap gap-3 text-xs text-[var(--color-muted)]">
          {location && <span>{location}</span>}
          {salaryRange && <span>{salaryRange}</span>}
        </div>
      )}

      {description && (
        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-[var(--color-muted)]">
          {description}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleView}
          disabled={!url}
          className={cn(
            "btn-primary text-xs",
            !url && "cursor-not-allowed opacity-50",
          )}
        >
          Ver vacante
        </button>

        <button
          type="button"
          onClick={handleToggleFavorite}
          disabled={isTogglingFavorite}
          className={cn(
            "btn-secondary text-xs",
            favorite &&
              "border-[var(--color-accent)] text-[var(--color-accent)]",
          )}
        >
          {favorite ? "En favoritos" : "Favorito"}
        </button>

        <CVPreview jobListingId={id} />
      </div>
    </div>
  );
}

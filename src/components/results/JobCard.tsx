"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { toggleJobSaved } from "@/server/agent/actions";

interface JobCardProps {
  id: string;
  platform: string;
  title: string;
  company: string;
  description?: string | null;
  url?: string | null;
  location?: string | null;
  salaryRange?: string | null;
  matchScore?: number | null;
  applied: boolean;
  saved: boolean;
  onApplied?: (jobId: string) => void;
  onSaved?: (jobId: string, saved: boolean) => void;
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
  matchScore,
  applied: initialApplied,
  saved: initialSaved,
  onApplied,
  onSaved,
}: JobCardProps) {
  const [isApplied, setIsApplied] = useState(initialApplied);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isTogglingSaved, setIsTogglingSaved] = useState(false);

  function handleApply() {
    if (!url) return;

    // Open the URL in a new tab
    window.open(url, "_blank", "noopener,noreferrer");

    // Mark as applied
    setIsApplied(true);
    onApplied?.(id);
  }

  async function handleToggleSaved() {
    if (isTogglingSaved) return;
    setIsTogglingSaved(true);

    try {
      const result = await toggleJobSaved(id);
      if (result.success) {
        setIsSaved(result.saved);
        onSaved?.(id, result.saved);
      }
    } finally {
      setIsTogglingSaved(false);
    }
  }

  const platformColors: Record<string, string> = {
    linkedin: "bg-[#0A66C2]/10 text-[#0A66C2]",
    indeed: "bg-[#003A9B]/10 text-[#003A9B]",
    occ: "bg-[#E67E22]/10 text-[#E67E22]",
  };

  return (
    <div className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "rounded-[10px] px-2.5 py-1 text-xs font-medium capitalize",
              platformColors[platform] ?? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
            )}
          >
            {platform}
          </span>

          {matchScore !== null && matchScore !== undefined && (
            <span className="rounded-[10px] bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400">
              {Math.round(matchScore * 100)}% match
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleToggleSaved}
          disabled={isTogglingSaved}
          className={cn(
            "transition-colors",
            isSaved
              ? "text-[var(--color-accent)]"
              : "text-[var(--color-muted)] hover:text-[var(--color-fg)]",
          )}
          aria-label={isSaved ? "Unsave job" : "Save job"}
        >
          <svg
            className="h-5 w-5"
            fill={isSaved ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={isSaved ? 0 : 1.5}
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
          {location && (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {location}
            </span>
          )}
          {salaryRange && (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {salaryRange}
            </span>
          )}
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
          onClick={handleApply}
          disabled={isApplied || !url}
          className={cn(
            "rounded-[10px] px-4 py-2 text-xs font-medium transition-all",
            isApplied
              ? "bg-green-500/10 text-green-400"
              : "bg-[var(--color-accent)] text-white hover:opacity-90",
            !url && "cursor-not-allowed opacity-50",
          )}
        >
          {isApplied ? "Applied ✓" : "Apply"}
        </button>

        <button
          type="button"
          onClick={handleToggleSaved}
          disabled={isTogglingSaved}
          className={cn(
            "rounded-[10px] border px-4 py-2 text-xs font-medium transition-all",
            isSaved
              ? "border-[var(--color-accent)] text-[var(--color-accent)]"
              : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-fg)]",
          )}
        >
          {isSaved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}

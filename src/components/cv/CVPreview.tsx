"use client";

import { useState, useEffect } from "react";
import { generateCV, saveCV } from "@/server/cv/actions";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  title?: string | null;
  location?: string | null;
  skills: string[];
  experience: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startYear: number;
    endYear?: number;
  }>;
}

interface JobListingData {
  id: string;
  title: string;
  company: string;
  matchScore?: number | null;
}

interface CVPreviewProps {
  profile: ProfileData;
  jobListing?: JobListingData | null;
}

export function CVPreview({ profile, jobListing }: CVPreviewProps) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveId, setSaveId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    loadCV();
  }, [profile.id, jobListing?.id]);

  async function loadCV() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateCV(
        profile.id,
        jobListing?.id,
      );

      if (result.error) {
        setError(result.error);
      } else {
        setContent(result.content);
      }
    } catch {
      setError("Failed to generate CV. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!content) return;
    setIsDownloading(true);

    try {
      const result = await saveCV({
        profileId: profile.id,
        jobListingId: jobListing?.id,
        content,
      });

      if (result.id) {
        setSaveId(result.id);

        // Trigger browser download
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `CV-${profile.name.replace(/\s+/g, "_")}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      setError("Failed to download CV.");
    } finally {
      setIsDownloading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg
          className="h-8 w-8 animate-spin text-[var(--color-accent)]"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[16px] border border-red-500/20 bg-red-500/5 p-8 text-center">
        <p className="mb-4 text-[var(--color-fg)]">{error}</p>
        <button
          type="button"
          onClick={loadCV}
          className="rounded-[10px] bg-[var(--color-accent)] px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {jobListing && (
        <div className="mb-6 rounded-[16px] border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 p-4">
          <p className="text-sm">
            CV tailored for{" "}
            <span className="font-semibold">{jobListing.title}</span> at{" "}
            {jobListing.company}
          </p>
          {jobListing.matchScore !== null &&
            jobListing.matchScore !== undefined && (
              <p className="mt-1 text-sm text-[var(--color-accent)]">
                {Math.round(jobListing.matchScore * 100)}% match
              </p>
            )}
        </div>
      )}

      <div className="mb-6 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
          {content}
        </pre>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isDownloading || !content}
        className="w-full rounded-[10px] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isDownloading ? "Downloading..." : "Download PDF"}
      </button>

      {saveId && (
        <p className="mt-3 text-center text-xs text-green-400">
          CV saved successfully!
        </p>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { getSearchStatus } from "@/server/agent/actions";

interface SearchOverlayProps {
  searchId: string;
  onComplete: () => void;
  onFailed: (error: string) => void;
}

export function SearchOverlay({
  searchId,
  onComplete,
  onFailed,
}: SearchOverlayProps) {
  const [status, setStatus] = useState<string>("pending");
  const [error, setError] = useState<string | null>(null);

  const poll = useCallback(async () => {
    const result = await getSearchStatus(searchId);

    if (result.error) {
      setError(result.error);
      onFailed(result.error);
      return;
    }

    setStatus(result.status);

    if (result.status === "completed") {
      onComplete();
    } else if (result.status === "failed") {
      const msg = "Search failed. Please try again.";
      setError(msg);
      onFailed(msg);
    }
  }, [searchId, onComplete, onFailed]);

  useEffect(() => {
    // Initial poll
    poll();

    // Poll every 2 seconds
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [poll]);

  if (status === "completed") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg)]/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-12">
        {error ? (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <svg
                className="h-8 w-8 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            <div className="text-center">
              <p className="text-lg font-medium text-[var(--color-fg)]">
                Search Failed
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
            </div>

            <button
              type="button"
              onClick={poll}
              className="rounded-[10px] bg-[var(--color-accent)] px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Retry
            </button>
          </>
        ) : (
          <>
            <div className="flex h-16 w-16 items-center justify-center">
              <svg
                className="h-10 w-10 animate-spin text-[var(--color-accent)]"
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

            <div className="text-center">
              <p className="text-lg font-medium text-[var(--color-fg)]">
                Searching for Jobs
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Analyzing your profile and scanning platforms...
              </p>
            </div>

            <p className="text-xs text-[var(--color-muted)]">
              Status: {status}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

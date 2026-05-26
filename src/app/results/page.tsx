"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { SearchOverlay } from "@/components/results/SearchOverlay";
import { JobCard } from "@/components/results/JobCard";
import { FilterChips } from "@/components/results/FilterChips";
import { getSearchWithResults } from "@/server/agent/actions";
import Link from "next/link";

interface JobListing {
  id: string;
  platform: string;
  title: string;
  company: string;
  description: string | null;
  url: string | null;
  location: string | null;
  salaryRange: string | null;
  matchScore: number | null;
  applied: number;
  saved: number;
}

export default function ResultsPage() {
  const [searchId, setSearchId] = useState<string | null>(null);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [listings, setListings] = useState<JobListing[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("currentSearchId");
    if (stored) {
      setSearchId(stored);
    }
  }, []);

  async function handleSearchComplete() {
    if (!searchId) return;
    setSearchCompleted(true);

    const result = await getSearchWithResults(searchId);
    if (result) {
      setListings(
        (result.listings as JobListing[]).map((l) => ({
          ...l,
          applied: l.applied ?? 0,
          saved: l.saved ?? 0,
        })),
      );
    }
  }

  function handleSearchFailed(_error: string) {
    setHasError(true);
  }

  function handleToggleFilter(platform: string) {
    setActiveFilters((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform],
    );
  }

  function handleApplied(jobId: string) {
    setListings((prev) =>
      prev.map((l) => (l.id === jobId ? { ...l, applied: 1 } : l)),
    );
  }

  function handleSaved(jobId: string, saved: boolean) {
    setListings((prev) =>
      prev.map((l) => (l.id === jobId ? { ...l, saved: saved ? 1 : 0 } : l)),
    );
  }

  // Get unique platforms from listings
  const availablePlatforms = [...new Set(listings.map((l) => l.platform))];

  // Filter listings
  const filteredListings =
    activeFilters.length > 0
      ? listings.filter((l) => activeFilters.includes(l.platform))
      : listings;

  return (
    <Container variant="results" className="py-10">
      <ProgressBar currentStep={3} />

      <h1 className="mb-8 text-2xl font-bold">Results</h1>

      {searchId && !searchCompleted && (
        <SearchOverlay
          searchId={searchId}
          onComplete={handleSearchComplete}
          onFailed={handleSearchFailed}
        />
      )}

      {!searchId && !hasError && (
        <div className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
          <p className="mb-4 text-[var(--color-muted)]">
            No search in progress. Start a search to see results.
          </p>
          <Link
            href="/search"
            className="inline-flex rounded-[10px] bg-[var(--color-accent)] px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Go to Search
          </Link>
        </div>
      )}

      {hasError && (
        <div className="rounded-[16px] border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="mb-4 text-[var(--color-fg)]">
            Something went wrong with your search.
          </p>
          <Link
            href="/search"
            className="inline-flex rounded-[10px] bg-[var(--color-accent)] px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Try Again
          </Link>
        </div>
      )}

      {searchCompleted && listings.length > 0 && (
        <>
          <div className="mb-6">
            <FilterChips
              platforms={availablePlatforms}
              activePlatforms={activeFilters}
              onToggle={handleToggleFilter}
            />
          </div>

          <div className="mb-2 text-sm text-[var(--color-muted)]">
            {filteredListings.length} of {listings.length} jobs
          </div>

          <div className="space-y-4">
            {filteredListings.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                platform={job.platform}
                title={job.title}
                company={job.company}
                description={job.description}
                url={job.url}
                location={job.location}
                salaryRange={job.salaryRange}
                matchScore={job.matchScore}
                applied={!!job.applied}
                saved={!!job.saved}
                onApplied={handleApplied}
                onSaved={handleSaved}
              />
            ))}
          </div>
        </>
      )}

      {searchCompleted && listings.length === 0 && (
        <div className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
          <p className="text-[var(--color-muted)]">
            No job listings found. Try different platforms or search criteria.
          </p>
        </div>
      )}
    </Container>
  );
}

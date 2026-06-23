"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { SearchProgress } from "@/components/search/SearchProgress";
import { JobCard } from "@/components/results/JobCard";
import { FilterChips } from "@/components/results/FilterChips";
import { getSearchWithResults } from "@/server/agent/actions";

interface JobListing {
  id: string;
  platform: string;
  title: string;
  company: string;
  description: string | null;
  url: string | null;
  location: string | null;
  salaryRange: string | null;
  postedDate: string | null;
  relevanceScore: number | null;
  isViewed: number;
  isFavorite: number;
}

const PAGE_SIZE = 20;

type LoadState = "loading" | "ready" | "error";

export function JobsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchId = searchParams.get("searchId");

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [isSearching, setIsSearching] = useState(false);
  const [listings, setListings] = useState<JobListing[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const loadResults = useCallback(async (id: string) => {
    setLoadState("loading");
    const result = await getSearchWithResults(id);
    if (!result) {
      setLoadState("error");
      return;
    }
    setListings(
      (result.listings as JobListing[]).map((l) => ({
        ...l,
        isViewed: l.isViewed ?? 0,
        isFavorite: l.isFavorite ?? 0,
      })),
    );
    setLoadState("ready");
  }, []);

  useEffect(() => {
    if (!searchId) {
      setLoadState("ready");
      return;
    }
    loadResults(searchId);
  }, [searchId, loadResults]);

  function handleSearchComplete() {
    setIsSearching(false);
    if (searchId) loadResults(searchId);
  }

  function handleSearchFailed(_error: string) {
    setIsSearching(false);
    setLoadState("error");
  }

  function handleRetry() {
    if (!searchId) return;
    setIsSearching(true);
    setLoadState("loading");
  }

  function handleToggleFilter(platform: string) {
    setActiveFilters((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform],
    );
    setVisibleCount(PAGE_SIZE);
  }

  function handleViewed(jobId: string) {
    setListings((prev) =>
      prev.map((l) => (l.id === jobId ? { ...l, isViewed: 1 } : l)),
    );
  }

  function handleFavorite(jobId: string, isFavorite: boolean) {
    setListings((prev) =>
      prev.map((l) =>
        l.id === jobId ? { ...l, isFavorite: isFavorite ? 1 : 0 } : l,
      ),
    );
  }

  const availablePlatforms = [...new Set(listings.map((l) => l.platform))];

  const filteredListings =
    activeFilters.length > 0
      ? listings.filter((l) => activeFilters.includes(l.platform))
      : listings;

  const visibleListings = filteredListings.slice(0, visibleCount);
  const hasMore = visibleCount < filteredListings.length;

  if (isSearching && searchId) {
    return (
      <Container variant="results" className="py-10">
        <SearchProgress
          searchId={searchId}
          onComplete={handleSearchComplete}
          onFailed={handleSearchFailed}
        />
      </Container>
    );
  }

  if (!searchId) {
    return (
      <Container variant="results" className="py-10">
        <div className="card p-8 text-center">
          <p className="mb-2 text-lg font-semibold text-[var(--color-fg)]">
            No hay búsqueda activa
          </p>
          <p className="mb-6 text-[var(--color-muted)]">
            Iniciá una búsqueda desde el dashboard para ver vacantes.
          </p>
          <Link href="/home" className="btn-primary inline-flex text-sm">
            Ir al Dashboard
          </Link>
        </div>
      </Container>
    );
  }

  if (loadState === "loading") {
    return (
      <Container variant="results" className="py-10">
        <div className="flex justify-center py-20">
          <span
            className="block h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-muted)] border-t-[var(--color-accent)]"
            role="progressbar"
            aria-valuetext="Cargando vacantes"
          />
        </div>
      </Container>
    );
  }

  if (loadState === "error") {
    return (
      <Container variant="results" className="py-10">
        <div className="card p-8 text-center">
          <p className="mb-2 text-lg font-semibold text-[var(--color-fg)]">
            Algo salió mal
          </p>
          <p className="mb-6 text-[var(--color-muted)]">
            No pudimos cargar los resultados de la búsqueda.
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={handleRetry}
              className="btn-primary text-sm"
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={() => router.push("/home")}
              className="btn-secondary text-sm"
            >
              Volver al dashboard
            </button>
          </div>
        </div>
      </Container>
    );
  }

  if (listings.length === 0) {
    return (
      <Container variant="results" className="py-10">
        <div className="card p-8 text-center">
          <p className="mb-2 text-lg font-semibold text-[var(--color-fg)]">
            No se encontraron vacantes
          </p>
          <p className="mb-6 text-[var(--color-muted)]">
            Probá con otras plataformas o términos de búsqueda.
          </p>
          <Link href="/home" className="btn-primary inline-flex text-sm">
            Volver al Dashboard
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container variant="results" className="py-10">
      <h1 className="mb-8 text-2xl font-bold">Vacantes</h1>

      {availablePlatforms.length > 0 && (
        <div className="mb-6">
          <FilterChips
            platforms={availablePlatforms}
            activePlatforms={activeFilters}
            onToggle={handleToggleFilter}
          />
        </div>
      )}

      <div className="mb-2 text-sm text-[var(--color-muted)]">
        {filteredListings.length} de {listings.length} vacantes
      </div>

      <div className="space-y-4">
        {visibleListings.map((job) => (
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
            relevanceScore={job.relevanceScore}
            isViewed={!!job.isViewed}
            isFavorite={!!job.isFavorite}
            onViewed={handleViewed}
            onFavorite={handleFavorite}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="btn-secondary text-sm"
          >
            Cargar más
          </button>
        </div>
      )}
    </Container>
  );
}
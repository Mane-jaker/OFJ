"use client";

import { useState } from "react";

export interface ViewedJob {
  id: string;
  title: string;
  company: string;
  url?: string | null;
  viewedAt?: string;
}

export interface SearchHistoryItem {
  id: string;
  terms: string[];
  resultsCount: number;
  createdAt: string;
}

export interface FavoriteJob {
  id: string;
  title: string;
  company: string;
  url?: string | null;
}

interface HistoryTabsProps {
  viewedJobs: ViewedJob[];
  searches: SearchHistoryItem[];
  favoriteJobs: FavoriteJob[];
}

type TabId = "viewed" | "searches" | "favorites";

const TABS: { id: TabId; label: string }[] = [
  { id: "viewed", label: "Vistas" },
  { id: "searches", label: "Búsquedas" },
  { id: "favorites", label: "Favoritos" },
];

function EmptyState({ message, cta }: { message: string; cta: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm text-[var(--color-muted)]">{message}</p>
      <a
        href="#search"
        className="mt-2 text-sm font-medium text-[var(--color-accent)] hover:underline"
      >
        {cta}
      </a>
    </div>
  );
}

function JobRow({
  title,
  company,
  url,
  meta,
}: {
  title: string;
  company: string;
  url?: string | null;
  meta?: string;
}) {
  const content = (
    <div className="flex items-center justify-between py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[var(--color-fg)]">
          {title}
        </p>
        <p className="truncate text-sm text-[var(--color-muted)]">
          {company}
          {meta ? ` · ${meta}` : ""}
        </p>
      </div>
      {url && (
        <span className="ml-3 shrink-0 text-xs text-[var(--color-accent)]">
          Abrir ↗
        </span>
      )}
    </div>
  );

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block border-b border-[var(--color-border)] last:border-0 transition-colors hover:bg-[var(--color-surface-hover)]"
      >
        {content}
      </a>
    );
  }
  return (
    <div className="block border-b border-[var(--color-border)] last:border-0">
      {content}
    </div>
  );
}

export function HistoryTabs({
  viewedJobs,
  searches,
  favoriteJobs,
}: HistoryTabsProps) {
  const [active, setActive] = useState<TabId>("viewed");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`chip ${active === tab.id ? "chip-active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[120px]">
        {active === "viewed" &&
          (viewedJobs.length === 0 ? (
            <EmptyState
              message="Aún no viste ninguna oferta."
              cta="Iniciá una búsqueda"
            />
          ) : (
            <div>
              {viewedJobs.map((job) => (
                <JobRow
                  key={job.id}
                  title={job.title}
                  company={job.company}
                  url={job.url}
                  meta={job.viewedAt}
                />
              ))}
            </div>
          ))}

        {active === "searches" &&
          (searches.length === 0 ? (
            <EmptyState
              message="No tenés búsquedas guardadas."
              cta="Iniciá tu primera búsqueda"
            />
          ) : (
            <div>
              {searches.map((search) => (
                <JobRow
                  key={search.id}
                  title={search.terms.join(", ") || "Búsqueda sin términos"}
                  company={`${search.resultsCount} resultados`}
                  meta={search.createdAt}
                />
              ))}
            </div>
          ))}

        {active === "favorites" &&
          (favoriteJobs.length === 0 ? (
            <EmptyState
              message="No marcaste favoritos todavía."
              cta="Iniciá una búsqueda y guardá ofertas"
            />
          ) : (
            <div>
              {favoriteJobs.map((job) => (
                <JobRow
                  key={job.id}
                  title={job.title}
                  company={job.company}
                  url={job.url}
                />
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}

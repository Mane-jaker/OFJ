import { Suspense } from "react";
import { JobsPageClient } from "./JobsPageClient";

export const dynamic = "force-dynamic";

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <span
            className="block h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-muted)] border-t-[var(--color-accent)]"
            role="progressbar"
            aria-valuetext="Cargando"
          />
        </div>
      }
    >
      <JobsPageClient />
    </Suspense>
  );
}
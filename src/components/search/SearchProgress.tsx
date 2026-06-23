"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getSearchStatus } from "@/server/agent/actions";

interface SearchProgressProps {
  searchId: string;
  onComplete: () => void;
  onFailed: (error: string) => void;
}

export function SearchProgress({
  searchId,
  onComplete,
  onFailed,
}: SearchProgressProps) {
  const [status, setStatus] = useState("pending");
  const [resultsCount, setResultsCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const settledRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const onFailedRef = useRef(onFailed);
  onCompleteRef.current = onComplete;
  onFailedRef.current = onFailed;

  const poll = useCallback(async () => {
    if (settledRef.current) return;
    const result = await getSearchStatus(searchId);

    setStatus(result.status);
    setResultsCount(result.resultsCount);

    if (result.status === "completed") {
      settledRef.current = true;
      onCompleteRef.current();
    } else if (result.status === "failed") {
      settledRef.current = true;
      const msg = result.error ?? "La búsqueda falló. Intentá de nuevo.";
      setError(msg);
      onFailedRef.current(msg);
    }
  }, [searchId]);

  useEffect(() => {
    settledRef.current = false;
    setError(null);
    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [poll]);

  function handleRetry() {
    settledRef.current = false;
    setError(null);
    setStatus("pending");
    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg)]/80 backdrop-blur-sm">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] px-10 py-12">
        {error ? (
          <>
            <div className="text-3xl text-[var(--color-danger)]" aria-hidden>
              ⚠
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-[var(--color-fg)]">
                La búsqueda falló
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleRetry}
                className="btn-primary"
              >
                Reintentar
              </button>
              <button
                type="button"
                onClick={() => onFailedRef.current(error)}
                className="btn-secondary"
              >
                Volver
              </button>
            </div>
          </>
        ) : (
          <>
            <span
              className="block h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-muted)] border-t-[var(--color-accent)]"
              role="progressbar"
              aria-valuetext="Buscando vacantes"
            />
            <div className="text-center">
              <p className="text-lg font-semibold text-[var(--color-fg)]">
                Buscando vacantes…
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Analizando tu perfil y recorriendo las plataformas. Esto puede
                tardar unos minutos.
              </p>
            </div>
            <p className="text-xs text-[var(--color-muted)]">
              Estado: {status}
              {status === "completed" ? ` · ${resultsCount} resultados` : ""}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
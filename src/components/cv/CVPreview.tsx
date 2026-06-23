"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  generateCv,
  getCvStatus,
  getCvTailoredData,
} from "@/server/cv/actions";
import { CVDocument } from "@/components/cv/CVDocument";
import type { CVDocumentProps } from "@/components/cv/CVDocument";

// PDFDownloadLink is client-only (uses browser APIs); load it dynamically
// to avoid SSR issues with @react-pdf/renderer's browser bundle.
const PDFDownloadLink = dynamic(
  () =>
    import("@react-pdf/renderer").then(
      (mod) =>
        mod.PDFDownloadLink as unknown as React.ComponentType<{
          document: React.ReactElement;
          fileName: string;
          className?: string;
          children: ReactNode;
        }>,
    ),
  { ssr: false },
);

interface CVPreviewProps {
  jobListingId: string;
  profileId?: string;
}

type Status = "idle" | "generating" | "ready" | "error";

interface TailoredData {
  name: string;
  tailoredSummary: string;
  tailoredSkills: string[];
  tailoredExperience: CVDocumentProps["tailoredExperience"];
}

export function CVPreview({ jobListingId }: CVPreviewProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TailoredData | null>(null);

  const loadExisting = useCallback(async () => {
    const statusResult = await getCvStatus(jobListingId);
    if (statusResult.exists) {
      const tailored = await getCvTailoredData(jobListingId);
      if (tailored.success) {
        setData({
          name: tailored.name ?? "",
          tailoredSummary: tailored.tailoredSummary ?? "",
          tailoredSkills: tailored.tailoredSkills ?? [],
          tailoredExperience: tailored.tailoredExperience ?? [],
        });
        setStatus("ready");
        return;
      }
    }
    setStatus("idle");
  }, [jobListingId]);

  useEffect(() => {
    loadExisting();
  }, [loadExisting]);

  async function handleGenerate() {
    setStatus("generating");
    setError(null);

    const result = await generateCv(jobListingId);
    if (!result.success) {
      setError(result.error ?? "Error al generar el CV");
      setStatus("error");
      return;
    }

    const tailored = await getCvTailoredData(jobListingId);
    if (!tailored.success) {
      setError(tailored.error ?? "Error al cargar el CV");
      setStatus("error");
      return;
    }

    setData({
      name: tailored.name ?? "",
      tailoredSummary: tailored.tailoredSummary ?? "",
      tailoredSkills: tailored.tailoredSkills ?? [],
      tailoredExperience: tailored.tailoredExperience ?? [],
    });
    setStatus("ready");
  }

  if (status === "generating") {
    return (
      <button
        type="button"
        disabled
        className="btn-primary text-xs inline-flex items-center gap-2"
      >
        <span
          className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
          role="progressbar"
          aria-valuetext="Generando"
        />
        Generando…
      </button>
    );
  }

  if (status === "error") {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="text-xs text-[var(--color-error)]">
          {error ?? "Error"}
        </span>
        <button
          type="button"
          onClick={handleGenerate}
          className="btn-secondary text-xs"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (status === "ready" && data) {
    return (
      <PDFDownloadLink
        document={<CVDocument {...data} />}
        fileName={`cv-${jobListingId}.pdf`}
        className="btn-secondary text-xs"
      >
        Ver PDF
      </PDFDownloadLink>
    );
  }

  return (
    <button
      type="button"
      onClick={handleGenerate}
      className={cn("btn-primary text-xs")}
    >
      Generar CV
    </button>
  );
}

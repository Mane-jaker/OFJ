"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelected: (file: File | null) => void;
  selectedFile: File | null;
}

const ACCEPTED_TYPES = ["application/pdf", "text/plain"];
const ACCEPTED_EXTENSIONS = [".pdf", ".txt"];

export function UploadZone({ onFileSelected, selectedFile }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function validateFile(file: File): boolean {
    const isAcceptedType = ACCEPTED_TYPES.includes(file.type);
    const hasAcceptedExt = ACCEPTED_EXTENSIONS.some((ext) =>
      file.name.toLowerCase().endsWith(ext),
    );

    if (!isAcceptedType && !hasAcceptedExt) {
      setError("Solo se aceptan archivos PDF y TXT");
      return false;
    }

    return true;
  }

  function handleSelect(file: File) {
    setError(null);
    if (validateFile(file)) {
      onFileSelected(file);
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;
    handleSelect(file);
  }

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    handleSelect(file);
  }

  function handleRemove() {
    onFileSelected(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  return (
    <div className="flex flex-col items-center">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Subí tu CV"
        className={cn(
          "flex w-full max-w-lg cursor-pointer flex-col items-center gap-4 rounded-[16px] border-2 border-dashed p-12 transition-colors",
          isDragging
            ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
            : "border-[var(--color-border)] hover:border-[var(--color-muted)]",
        )}
      >
        <svg
          className="h-10 w-10 text-[var(--color-muted)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        {selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-[var(--color-fg)]">
              {selectedFile.name}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="text-xs text-[var(--color-accent)] hover:underline"
            >
              Quitar
            </button>
          </div>
        ) : (
          <>
            <p className="text-base font-medium text-[var(--color-fg)]">
              Soltá tu CV acá o hacé clic para buscar
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              Soporta PDF y TXT
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,application/pdf,text/plain"
          onChange={handleFileSelect}
          className="hidden"
          data-testid="file-input"
        />
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

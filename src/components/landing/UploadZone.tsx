"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileParsed?: (text: string, fileName: string) => void;
  onError?: (error: string) => void;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "text/plain",
];

const ACCEPTED_EXTENSIONS = [".pdf", ".txt"];

export function UploadZone({ onFileParsed, onError }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function validateFile(file: File): boolean {
    const isAcceptedType = ACCEPTED_TYPES.includes(file.type);
    const hasAcceptedExt = ACCEPTED_EXTENSIONS.some((ext) =>
      file.name.toLowerCase().endsWith(ext),
    );

    if (!isAcceptedType && !hasAcceptedExt) {
      const msg = "Only PDF and text files are accepted.";
      setError(msg);
      onError?.(msg);
      return false;
    }

    return true;
  }

  async function processFile(file: File) {
    setError(null);
    setIsProcessing(true);

    try {
      const text = await file.text();
      setFileName(file.name);
      onFileParsed?.(text, file.name);
    } catch {
      const msg = "Failed to read file. Please try again.";
      setError(msg);
      onError?.(msg);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (validateFile(file)) {
      processFile(file);
    }
  }

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (validateFile(file)) {
      processFile(file);
    }
  }

  function handleRemove() {
    setFileName(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
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
        aria-label="Upload your CV"
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

        {fileName ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-[var(--color-fg)]">
              {fileName}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="text-xs text-[var(--color-accent)] hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <p className="text-base font-medium text-[var(--color-fg)]">
              {isProcessing
                ? "Processing..."
                : "Drop your CV here or click to browse"}
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              Supports PDF and text files
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

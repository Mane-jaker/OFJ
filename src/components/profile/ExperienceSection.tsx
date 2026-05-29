"use client";

import { useState } from "react";
import type { Experience } from "@/server/db/schema";

interface ExperienceSectionProps {
  experiences: Experience[];
  onChange?: (experiences: Experience[]) => void;
  readOnly?: boolean;
}

function emptyExperience(): Experience {
  return { company: "", title: "", startDate: "", endDate: "", description: "" };
}

export function ExperienceSection({
  experiences,
  onChange,
  readOnly = false,
}: ExperienceSectionProps) {
  const [items, setItems] = useState<Experience[]>(experiences);

  function updateItem(index: number, field: keyof Experience, value: string) {
    if (readOnly) return;
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    setItems(updated);
    onChange?.(updated);
  }

  function addItem() {
    if (readOnly) return;
    const updated = [...items, emptyExperience()];
    setItems(updated);
    onChange?.(updated);
  }

  function removeItem(index: number) {
    if (readOnly) return;
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    onChange?.(updated);
  }

  const currentItems = readOnly ? experiences : items;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Experiencia</h3>
        {!readOnly && (
          <button
            type="button"
            onClick={addItem}
            className="rounded-[10px] bg-[var(--color-accent)] px-4 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            + Add Experience
          </button>
        )}
      </div>

      {currentItems.length === 0 && (
        <p className="text-sm text-[var(--color-muted)]">
          {readOnly
            ? "Sin experiencia registrada"
            : 'No experience added yet. Click "Add Experience" to get started.'}
        </p>
      )}

      {currentItems.map((item, index) => (
        <div
          key={index}
          className="rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
        >
          {readOnly ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-[var(--color-fg)]">
                {item.title || "—"}
              </p>
              <p className="text-sm text-[var(--color-muted)]">
                {item.company}
                {item.startDate && ` · ${item.startDate}${item.endDate ? ` — ${item.endDate}` : ""}`}
              </p>
              {item.description && (
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-fg)]/80">
                  {item.description}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="mb-3 grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={item.company}
                  onChange={(e) => updateItem(index, "company", e.target.value)}
                  placeholder="Company"
                  className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateItem(index, "title", e.target.value)}
                  placeholder="Title"
                  className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
                <input
                  type="text"
                  value={item.startDate}
                  onChange={(e) =>
                    updateItem(index, "startDate", e.target.value)
                  }
                  placeholder="Start date"
                  className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
                <input
                  type="text"
                  value={item.endDate ?? ""}
                  onChange={(e) =>
                    updateItem(index, "endDate", e.target.value)
                  }
                  placeholder="End date (optional)"
                  className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>

              <textarea
                value={item.description ?? ""}
                onChange={(e) =>
                  updateItem(index, "description", e.target.value)
                }
                placeholder="Description (optional)"
                rows={3}
                className="mb-3 w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />

              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-xs text-red-400 hover:underline"
              >
                Remove
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

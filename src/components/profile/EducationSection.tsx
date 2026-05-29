"use client";

import { useState } from "react";
import type { Education } from "@/server/db/schema";

interface EducationSectionProps {
  educations: Education[];
  onChange?: (educations: Education[]) => void;
  readOnly?: boolean;
}

function emptyEducation(): Education {
  return {
    institution: "",
    degree: "",
    field: "",
    startYear: new Date().getFullYear(),
    endYear: undefined,
  };
}

export function EducationSection({
  educations,
  onChange,
  readOnly = false,
}: EducationSectionProps) {
  const [items, setItems] = useState<Education[]>(educations);

  function updateItem(
    index: number,
    field: keyof Education,
    value: string | number | boolean | undefined,
  ) {
    if (readOnly) return;
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    setItems(updated);
    onChange?.(updated);
  }

  function addItem() {
    if (readOnly) return;
    const updated = [...items, emptyEducation()];
    setItems(updated);
    onChange?.(updated);
  }

  function removeItem(index: number) {
    if (readOnly) return;
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    onChange?.(updated);
  }

  const currentItems = readOnly ? educations : items;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Educación</h3>
        {!readOnly && (
          <button
            type="button"
            onClick={addItem}
            className="rounded-[10px] bg-[var(--color-accent)] px-4 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            + Add Education
          </button>
        )}
      </div>

      {currentItems.length === 0 && (
        <p className="text-sm text-[var(--color-muted)]">
          {readOnly
            ? "Sin educación registrada"
            : 'No education added yet. Click "Add Education" to get started.'}
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
                {item.degree || "—"}
              </p>
              <p className="text-sm text-[var(--color-muted)]">
                {item.institution}
                {item.startYear
                  ? ` · ${item.startYear}${item.endYear ? ` — ${item.endYear}` : ""}`
                  : ""}
              </p>
              {item.field && (
                <p className="text-sm text-[var(--color-fg)]/80">
                  {item.field}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="mb-3 grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={item.institution}
                  onChange={(e) =>
                    updateItem(index, "institution", e.target.value)
                  }
                  placeholder="Institution"
                  className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
                <input
                  type="text"
                  value={item.degree}
                  onChange={(e) =>
                    updateItem(index, "degree", e.target.value)
                  }
                  placeholder="Degree"
                  className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
                <input
                  type="text"
                  value={item.field}
                  onChange={(e) =>
                    updateItem(index, "field", e.target.value)
                  }
                  placeholder="Field of study"
                  className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={item.startYear}
                    onChange={(e) =>
                      updateItem(index, "startYear", Number(e.target.value))
                    }
                    placeholder="Start year"
                    className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                  <input
                    type="number"
                    value={item.endYear ?? ""}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "endYear",
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    placeholder="End year"
                    className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                </div>
              </div>

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

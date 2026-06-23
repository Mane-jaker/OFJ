"use client";

import { useState, type KeyboardEvent, useRef, useEffect } from "react";

interface SearchChipsProps {
  terms: string[];
  onChange: (terms: string[]) => void;
}

export function SearchChips({ terms, onChange }: SearchChipsProps) {
  const [input, setInput] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingIndex !== null && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingIndex]);

  function addTerm() {
    const trimmed = input.trim();
    if (trimmed && !terms.includes(trimmed)) {
      onChange([...terms, trimmed]);
    }
    setInput("");
  }

  function handleInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTerm();
    }
  }

  function removeTerm(index: number) {
    onChange(terms.filter((_, i) => i !== index));
  }

  function startEdit(index: number) {
    setEditingIndex(index);
    setEditValue(terms[index]);
  }

  function commitEdit() {
    if (editingIndex === null) return;
    const trimmed = editValue.trim();
    if (trimmed && !terms.includes(trimmed)) {
      const next = [...terms];
      next[editingIndex] = trimmed;
      onChange(next);
    } else if (!trimmed) {
      removeTerm(editingIndex);
    }
    setEditingIndex(null);
    setEditValue("");
  }

  function handleEditKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditingIndex(null);
      setEditValue("");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {terms.map((term, index) =>
          editingIndex === index ? (
            <input
              key={`edit-${index}`}
              ref={editInputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleEditKeyDown}
              onBlur={commitEdit}
              className="rounded-full border border-[var(--color-accent)] bg-[var(--color-surface)] px-3 py-1 text-sm text-[var(--color-fg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          ) : (
            <span
              key={term}
              className="chip chip-active cursor-default"
              onDoubleClick={() => startEdit(index)}
              title="Doble clic para editar"
            >
              {term}
              <button
                type="button"
                onClick={() => removeTerm(index)}
                className="inline-flex h-4 w-4 items-center justify-center rounded-full text-xs opacity-80 hover:opacity-100"
                aria-label={`Eliminar ${term}`}
              >
                ✕
              </button>
            </span>
          ),
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Agregar término…"
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />
          <button
            type="button"
            onClick={addTerm}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-fg)] transition-colors hover:bg-[var(--color-surface-hover)]"
            aria-label="Agregar término de búsqueda"
          >
            +
          </button>
        </div>
      </div>

      {terms.length === 0 && (
        <p className="text-sm text-[var(--color-muted)]">
          Agregá términos de búsqueda (Enter para añadir, doble clic para editar).
        </p>
      )}
    </div>
  );
}

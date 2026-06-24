"use client";

import { useState, type KeyboardEvent } from "react";

interface RolesSectionProps {
  roles: string[];
  onChange?: (roles: string[]) => void;
  readOnly?: boolean;
}

const MAX_ROLES = 3;

export function RolesSection({
  roles,
  onChange,
  readOnly = false,
}: RolesSectionProps) {
  const [input, setInput] = useState("");

  function addRole() {
    if (readOnly) return;
    const trimmed = input.trim();
    if (trimmed && !roles.includes(trimmed) && roles.length < MAX_ROLES) {
      onChange?.([...roles, trimmed]);
    }
    setInput("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addRole();
    }
  }

  function removeRole(role: string) {
    if (readOnly) return;
    onChange?.(roles.filter((r) => r !== role));
  }

  const atMax = roles.length >= MAX_ROLES;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Roles objetivo</h3>
        <span className="text-xs text-[var(--color-muted)]">
          {roles.length}/{MAX_ROLES}
        </span>
      </div>

      <p className="text-xs text-[var(--color-muted)]">
        Usá estos como keywords principales para tus búsquedas en LinkedIn.
        {!readOnly && " Enter para agregar."}
      </p>

      <div className="flex flex-wrap gap-2">
        {roles.map((role) => (
          <span
            key={role}
            className="inline-flex items-center gap-1.5 rounded-[10px] bg-[var(--color-accent)]/10 px-3 py-1 text-sm text-[var(--color-accent)]"
          >
            {role}
            {!readOnly && (
              <button
                type="button"
                onClick={() => removeRole(role)}
                className="inline-flex h-4 w-4 items-center justify-center rounded-full text-xs hover:bg-[var(--color-accent)]/20"
                aria-label={`Eliminar ${role}`}
              >
                ✕
              </button>
            )}
          </span>
        ))}
        {roles.length === 0 && (
          <p className="text-sm text-[var(--color-muted)]">
            {readOnly
              ? "Sin roles definidos"
              : "Agregá hasta 3 roles objetivo."}
          </p>
        )}
      </div>

      {!readOnly && (
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={atMax}
            placeholder={
              atMax
                ? "Máximo 3 roles"
                : 'Ej: "Senior Java Developer", "DevOps Engineer"'
            }
            className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      )}
    </div>
  );
}

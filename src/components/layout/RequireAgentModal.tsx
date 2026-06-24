"use client";

interface RequireAgentModalProps {
  description: string;
  onCancel: () => void;
}

export function RequireAgentModal({
  description,
  onCancel,
}: RequireAgentModalProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--color-bg)]/60 backdrop-blur-sm"
      onClick={onCancel}
      onKeyDown={(e) => e.key === "Escape" && onCancel()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="mx-4 w-full max-w-sm rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--color-accent)]/10 text-lg"
            aria-hidden
          >
            ⚡
          </span>
          <div className="flex-1">
            <p className="text-base font-semibold text-[var(--color-fg)]">
              Se necesita un agent conectado
            </p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Para {description} necesitamos que tengas OpenCode conectado desde
              el botón en el header.
            </p>
          </div>
        </div>

        <div className="rounded-[10px] bg-[var(--color-accent)]/5 p-3 text-sm text-[var(--color-muted)]">
          Conectá un Agent desde el botón en la barra superior y volvé a
          intentar la acción.
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary text-sm"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

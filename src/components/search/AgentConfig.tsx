"use client";

import { useAgent } from "@/components/layout/AgentContext";

interface AgentConfigProps {
  model: string;
  onModelChange: (model: string) => void;
  errors?: { model?: string };
}

export function AgentConfig({
  model,
  onModelChange,
  errors,
}: AgentConfigProps) {
  const { connectionState, models } = useAgent();
  const isConnected = connectionState === "connected";

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[var(--color-fg)]">
        AI Model
      </h3>

      <div>
        <label
          htmlFor="model"
          className="mb-1.5 block text-sm font-medium text-[var(--color-fg)]"
        >
          Model <span className="text-[var(--color-danger)]">*</span>
        </label>

        {isConnected && models.length > 0 ? (
          <select
            id="model"
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            className={`w-full rounded-[10px] border bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-fg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${
              errors?.model
                ? "border-[var(--color-danger)]"
                : "border-[var(--color-border)]"
            }`}
          >
            <option value="">Select a model</option>
            {models.map((m) => (
              <option
                key={`${m.providerID}/${m.modelID}`}
                value={`${m.providerID}/${m.modelID}`}
              >
                {m.providerName} / {m.modelName}
              </option>
            ))}
          </select>
        ) : (
          <div
            className={`w-full rounded-[10px] border bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-muted)] ${
              errors?.model
                ? "border-[var(--color-danger)]"
                : "border-[var(--color-border)]"
            }`}
          >
            {isConnected
              ? "Conectá un Agente desde el header para ver los modelos disponibles."
              : "Conectá OpenCode desde el header primero."}
          </div>
        )}

        {errors?.model && (
          <p className="mt-1 text-xs text-[var(--color-danger)]">
            {errors.model}
          </p>
        )}
      </div>
    </div>
  );
}

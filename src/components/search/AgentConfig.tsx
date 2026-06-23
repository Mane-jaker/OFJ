"use client";

const MODEL_OPTIONS = [
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { value: "claude-3.5-haiku", label: "Claude 3.5 Haiku" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { value: "deepseek-v4", label: "DeepSeek V4" },
];

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
          {MODEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors?.model && (
          <p className="mt-1 text-xs text-[var(--color-danger)]">
            {errors.model}
          </p>
        )}
      </div>
    </div>
  );
}

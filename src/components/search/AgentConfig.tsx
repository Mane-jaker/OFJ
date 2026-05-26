"use client";

const MODEL_OPTIONS = [
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { value: "claude-3.5-haiku", label: "Claude 3.5 Haiku" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
];

interface AgentConfigProps {
  apiKey: string;
  model: string;
  onApiKeyChange: (key: string) => void;
  onModelChange: (model: string) => void;
  errors?: { apiKey?: string; model?: string };
}

export function AgentConfig({
  apiKey,
  model,
  onApiKeyChange,
  onModelChange,
  errors,
}: AgentConfigProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">AI Agent Configuration</h3>

      <div>
        <label
          htmlFor="apiKey"
          className="mb-1 block text-sm font-medium text-[var(--color-fg)]"
        >
          API Key <span className="text-red-400">*</span>
        </label>
        <input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          className={`w-full rounded-[10px] border bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${
            errors?.apiKey
              ? "border-red-400"
              : "border-[var(--color-border)]"
          }`}
          placeholder="Enter your AI provider API key"
        />
        {errors?.apiKey && (
          <p className="mt-1 text-xs text-red-400">{errors.apiKey}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="model"
          className="mb-1 block text-sm font-medium text-[var(--color-fg)]"
        >
          AI Model <span className="text-red-400">*</span>
        </label>
        <select
          id="model"
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          className={`w-full rounded-[10px] border bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-fg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${
            errors?.model
              ? "border-red-400"
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
          <p className="mt-1 text-xs text-red-400">{errors.model}</p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { PlatformSelector } from "@/components/search/PlatformSelector";
import { AgentConfig } from "@/components/search/AgentConfig";
import { startSearch } from "@/server/agent/actions";

export default function SearchPage() {
  const router = useRouter();
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [errors, setErrors] = useState<{
    platforms?: string;
    apiKey?: string;
    model?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const newErrors: typeof errors = {};

    if (platforms.length === 0) {
      newErrors.platforms = "Select at least one platform";
    }

    if (!apiKey.trim()) {
      newErrors.apiKey = "API key is required";
    }

    if (!model) {
      newErrors.model = "Select an AI model";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleStartSearch() {
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const result = await startSearch({
        platforms,
        apiKey,
        model,
      });

      if (result.searchId) {
        // Store the current search ID for the results page
        sessionStorage.setItem("currentSearchId", result.searchId);
        router.push("/results");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Container variant="form" className="py-10">
      <ProgressBar currentStep={2} />

      <div className="mb-6">
        <Link
          href="/profile"
          className="text-sm text-[var(--color-accent)] hover:underline"
        >
          &larr; Back to Profile
        </Link>
      </div>

      <h1 className="mb-8 text-2xl font-bold">Search Configuration</h1>

      <div className="space-y-8">
        <PlatformSelector platforms={platforms} onChange={setPlatforms} />
        {errors.platforms && (
          <p className="text-xs text-red-400">{errors.platforms}</p>
        )}

        <AgentConfig
          apiKey={apiKey}
          model={model}
          onApiKeyChange={setApiKey}
          onModelChange={setModel}
          errors={errors}
        />

        <button
          type="button"
          onClick={handleStartSearch}
          disabled={isSubmitting}
          className="w-full rounded-[10px] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Starting Search..." : "Start Search"}
        </button>
      </div>
    </Container>
  );
}

"use server";

import { isConnected, getConnection } from "./connection";
import type { Provider } from "@opencode-ai/sdk";

export interface ProviderModel {
  providerID: string;
  providerName: string;
  modelID: string;
  modelName: string;
}

export interface ProviderInfo {
  id: string;
  name: string;
}

export async function listProviders(): Promise<{
  providers: ProviderInfo[];
  models: ProviderModel[];
  error?: string;
}> {
  if (!isConnected()) {
    return {
      providers: [],
      models: [],
      error: "No hay un agent conectado. Conectá uno desde el header.",
    };
  }

  try {
    const conn = getConnection()!;
    const response = await conn.client.config.providers();

    const rawProviders: Provider[] = response.data?.providers ?? [];
    const providers: ProviderInfo[] = rawProviders.map((p) => ({
      id: p.id,
      name: p.name,
    }));

    const models: ProviderModel[] = [];
    for (const provider of rawProviders) {
      const modelMap = provider.models;
      if (!modelMap) continue;
      for (const [modelId, modelData] of Object.entries(modelMap)) {
        models.push({
          providerID: provider.id,
          providerName: provider.name,
          modelID: modelId,
          modelName: modelData.name ?? modelId,
        });
      }
    }

    return { providers, models };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list providers";
    return { providers: [], models: [], error: message };
  }
}

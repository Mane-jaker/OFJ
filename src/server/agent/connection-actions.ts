"use server";

import {
  connect as connectServer,
  disconnect as disconnectServer,
  isConnected,
  getConnection,
  checkHealth,
} from "./connection";
import { setModel, getModelString, clearModel } from "./model-store";
import { updateHeartbeat } from "./connection-store";

export type AgentStatus =
  | { connected: false }
  | {
      connected: true;
      port: number;
      pid: number;
      startedAt: string;
      model: string | null;
    };

export async function connectAgent(agentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (agentId !== "opencode") {
      return { success: false, error: `Unknown agent: ${agentId}` };
    }

    if (isConnected()) {
      const healthy = await checkHealth();
      if (!healthy) {
        disconnectServer();
      } else {
        return { success: true };
      }
    }

    await connectServer();
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to connect agent";
    return { success: false, error: message };
  }
}

export async function disconnectAgent(): Promise<{ success: boolean }> {
  disconnectServer();
  return { success: true };
}

export async function getAgentStatus(): Promise<AgentStatus> {
  if (!isConnected()) return { connected: false };

  const healthy = await checkHealth();
  if (!healthy) {
    disconnectServer();
    return { connected: false };
  }

  const conn = getConnection()!;
  return {
    connected: true,
    port: conn.port,
    pid: conn.pid,
    startedAt: conn.startedAt.toISOString(),
    model: getModelString(),
  };
}

export async function selectModel(
  providerID: string,
  modelID: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    setModel(providerID, modelID);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to select model";
    return { success: false, error: message };
  }
}

export async function clearSelectedModel(): Promise<{ success: boolean }> {
  clearModel();
  return { success: true };
}

export async function recordHeartbeat(): Promise<{ success: boolean }> {
  try {
    updateHeartbeat();
    return { success: true };
  } catch {
    return { success: false };
  }
}

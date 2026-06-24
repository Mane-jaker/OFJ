"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";

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

type ConnectionState = "disconnected" | "connecting" | "connected";

interface AgentContextValue {
  connectionState: ConnectionState;
  connectedAgent: string | null;
  model: { providerID: string; modelID: string } | null;
  providers: ProviderInfo[];
  models: ProviderModel[];
  error: string | null;
  connect: (agentId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  selectModel: (providerID: string, modelID: string) => Promise<void>;
  refreshProviders: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

const AgentContext = createContext<AgentContextValue | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [connectedAgent, setConnectedAgent] = useState<string | null>(null);
  const [model, setModel] = useState<{
    providerID: string;
    modelID: string;
  } | null>(null);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [models, setModels] = useState<ProviderModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const { getAgentStatus } = await import(
        "@/server/agent/connection-actions"
      );
      const status = await getAgentStatus();
      if (status.connected) {
        setConnectionState("connected");
        setConnectedAgent("opencode");
        if (status.model) {
          const [pid, mid] = status.model.split("/");
          setModel({ providerID: pid, modelID: mid });
        }
      } else {
        setConnectionState("disconnected");
        setConnectedAgent(null);
      }
    } catch {
      setConnectionState("disconnected");
      setConnectedAgent(null);
    }
  }, []);

  const refreshProviders = useCallback(async () => {
    try {
      const { listProviders } = await import(
        "@/server/agent/providers-actions"
      );
      const result = await listProviders();
      if (result.error) {
        setError(result.error);
      } else {
        setProviders(result.providers);
        setModels(result.models);
        setError(null);
      }
    } catch {
      setError("Error al cargar providers");
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    if (connectionState === "connected") {
      (async () => {
        try {
          const { recordHeartbeat } = await import(
            "@/server/agent/connection-actions"
          );
          await recordHeartbeat();
        } catch {}
      })();

      heartbeatRef.current = setInterval(() => {
        (async () => {
          try {
            const { recordHeartbeat } = await import(
              "@/server/agent/connection-actions"
            );
            await recordHeartbeat();
          } catch {}
        })();
      }, 30_000);
    }

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };
  }, [connectionState]);

  const connect = useCallback(
    async (agentId: string) => {
      setConnectionState("connecting");
      setError(null);
      try {
        const { connectAgent } = await import(
          "@/server/agent/connection-actions"
        );
        const result = await connectAgent(agentId);
        if (result.success) {
          setConnectionState("connected");
          setConnectedAgent(agentId);
          await refreshProviders();
        } else {
          setError(result.error ?? "Error al conectar");
          setConnectionState("disconnected");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al conectar agent",
        );
        setConnectionState("disconnected");
      }
    },
    [refreshProviders],
  );

  const disconnect = useCallback(async () => {
    try {
      const { disconnectAgent } = await import(
        "@/server/agent/connection-actions"
      );
      await disconnectAgent();
    } finally {
      setConnectionState("disconnected");
      setConnectedAgent(null);
      setModel(null);
      setProviders([]);
      setModels([]);
      setError(null);
    }
  }, []);

  const selectModel = useCallback(
    async (providerID: string, modelID: string) => {
      setError(null);
      try {
        const { selectModel: selectModelAction } = await import(
          "@/server/agent/connection-actions"
        );
        const result = await selectModelAction(providerID, modelID);
        if (result.success) {
          setModel({ providerID, modelID });
        } else {
          setError(result.error ?? "Error al seleccionar modelo");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al seleccionar modelo",
        );
      }
    },
    [],
  );

  return (
    <AgentContext.Provider
      value={{
        connectionState,
        connectedAgent,
        model,
        providers,
        models,
        error,
        connect,
        disconnect,
        selectModel,
        refreshProviders,
        refreshStatus,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error("useAgent must be used within AgentProvider");
  }
  return context;
}

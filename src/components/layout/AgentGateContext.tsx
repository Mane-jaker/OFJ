"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useAgent } from "./AgentContext";
import { RequireAgentModal } from "./RequireAgentModal";

type PendingAction = {
  action: () => void | Promise<void>;
  description: string;
};

interface AgentGateValue {
  requireAgent: (
    action: () => void | Promise<void>,
    description: string,
  ) => void;
}

const AgentGateContext = createContext<AgentGateValue>({
  requireAgent: () => {},
});

export function AgentGateProvider({ children }: { children: ReactNode }) {
  const { connectionState } = useAgent();
  const [pending, setPending] = useState<PendingAction | null>(null);

  const requireAgent: AgentGateValue["requireAgent"] = useCallback(
    (action, description) => {
      if (connectionState === "connected") {
        action();
      } else {
        setPending({ action, description });
      }
    },
    [connectionState],
  );

  useEffect(() => {
    if (connectionState === "connected" && pending) {
      const fn = pending.action;
      setPending(null);
      fn();
    }
  }, [connectionState, pending]);

  return (
    <AgentGateContext.Provider value={{ requireAgent }}>
      {children}
      {pending && (
        <RequireAgentModal
          description={pending.description}
          onCancel={() => setPending(null)}
        />
      )}
    </AgentGateContext.Provider>
  );
}

export function useAgentGate() {
  return useContext(AgentGateContext);
}

"use client";

import { useState, useRef, useEffect } from "react";
import { useAgent } from "./AgentContext";

const AGENTS = [
  { id: "opencode", name: "OpenCode", description: "Local AI coding agent" },
];

export function AgentStatus() {
  const {
    connectionState,
    connectedAgent,
    model,
    models,
    error,
    connect,
    disconnect,
    selectModel,
    refreshProviders,
  } = useAgent();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isConnected = connectionState === "connected";
  const isConnecting = connectionState === "connecting";

  function dotColor() {
    if (isConnecting) return "bg-yellow-400";
    if (isConnected) return "bg-green-500";
    return "bg-gray-500";
  }

  function agentLabel() {
    if (isConnecting) return "Conectando…";
    if (isConnected) {
      const name = AGENTS.find((a) => a.id === connectedAgent)?.name ?? connectedAgent;
      const modelStr = model
        ? models.find(
            (m) => m.providerID === model.providerID && m.modelID === model.modelID,
          )?.modelName ?? model.modelID
        : "sin modelo";
      return `${name} · ${modelStr}`;
    }
    return "Conectar Agent";
  }

  async function handleConnect(agentId: string) {
    await connect(agentId);
    setOpen(false);
  }

  async function handleDisconnect() {
    await disconnect();
    setOpen(false);
  }

  async function handleSelectModel(providerID: string, modelID: string) {
    await selectModel(providerID, modelID);
    setOpen(false);
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={isConnecting}
        className="flex items-center gap-2 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-fg)] transition-colors hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
      >
        <span
          className={`inline-block h-2 w-2 rounded-full ${dotColor()}`}
        />
        <span className="max-w-[180px] truncate">{agentLabel()}</span>
        <svg
          className={`h-3.5 w-3.5 text-[var(--color-muted)] transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-lg">
          {!isConnected ? (
            <div className="space-y-1">
              <p className="px-2 py-1 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
                Seleccioná un agent
              </p>
              {AGENTS.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => handleConnect(agent.id)}
                  disabled={isConnecting}
                  className="flex w-full items-center gap-3 rounded-[8px] px-3 py-2 text-left transition-colors hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--color-accent)]/10 text-sm">
                    ⚡
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--color-fg)]">
                      {agent.name}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {agent.description}
                    </p>
                  </div>
                  <span className="btn-primary !rounded-[6px] !px-3 !py-1 !text-xs">
                    Conectar
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="border-b border-[var(--color-border)] px-2 pb-2">
                <p className="text-sm font-medium text-[var(--color-fg)]">
                  {AGENTS.find((a) => a.id === connectedAgent)?.name ??
                    connectedAgent}
                </p>
                <p className="text-xs text-[var(--color-success)]">
                  Conectado
                </p>
              </div>

              {error && (
                <p className="rounded-[6px] bg-[var(--color-danger-bg)] px-3 py-1 text-xs text-[var(--color-danger)]">
                  {error}
                </p>
              )}

              <div className="px-2">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
                  Modelo
                </p>
                <div className="mt-1 max-h-48 space-y-0.5 overflow-y-auto">
                  {models.length === 0 ? (
                    <button
                      onClick={() => refreshProviders()}
                      className="w-full rounded-[6px] px-2 py-1.5 text-left text-xs text-[var(--color-accent)] hover:bg-[var(--color-surface-hover)]"
                    >
                      Cargar modelos
                    </button>
                  ) : (
                    <div className="space-y-0.5">
                      {models.map((m) => {
                        const isSelected =
                          model?.providerID === m.providerID &&
                          model?.modelID === m.modelID;
                        return (
                          <button
                            key={`${m.providerID}/${m.modelID}`}
                            onClick={() =>
                              handleSelectModel(m.providerID, m.modelID)
                            }
                            className={`w-full rounded-[6px] px-2 py-1.5 text-left text-xs transition-colors hover:bg-[var(--color-surface-hover)] ${
                              isSelected
                                ? "bg-[var(--color-accent)]/10 font-medium text-[var(--color-accent)]"
                                : "text-[var(--color-fg)]"
                            }`}
                          >
                            <span className="text-[var(--color-muted)]">
                              {m.providerName} /{" "}
                            </span>
                            {m.modelName}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-[var(--color-border)] pt-1">
                <button
                  onClick={handleDisconnect}
                  className="w-full rounded-[8px] px-3 py-2 text-left text-sm text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger-bg)]"
                >
                  Desconectar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgentConfig } from "./AgentConfig";
import { AgentProvider } from "@/components/layout/AgentContext";

function renderWithAgent(ui: React.ReactElement) {
  return render(<AgentProvider>{ui}</AgentProvider>);
}

describe("AgentConfig", () => {
  it("renders model section", () => {
    renderWithAgent(
      <AgentConfig model="" onModelChange={vi.fn()} />,
    );

    expect(screen.getByText(/AI Model/i)).toBeDefined();
  });

  it("shows connect message when not connected", () => {
    renderWithAgent(
      <AgentConfig model="" onModelChange={vi.fn()} />,
    );

    expect(
      screen.getByText(/Conectá OpenCode desde el header primero/i),
    ).toBeDefined();
  });

  it("displays required field error for model", () => {
    renderWithAgent(
      <AgentConfig
        model=""
        onModelChange={vi.fn()}
        errors={{ model: "Select an AI model" }}
      />,
    );

    expect(screen.getByText("Select an AI model")).toBeDefined();
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgentConfig } from "./AgentConfig";

describe("AgentConfig", () => {
  it("renders API key input and model selector", () => {
    render(
      <AgentConfig
        apiKey=""
        model=""
        onApiKeyChange={vi.fn()}
        onModelChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/API Key/i)).toBeDefined();
    expect(screen.getByLabelText(/AI Model/i)).toBeDefined();
  });

  it("masks API key input (type=password)", () => {
    render(
      <AgentConfig
        apiKey="sk-test-key"
        model=""
        onApiKeyChange={vi.fn()}
        onModelChange={vi.fn()}
      />,
    );

    const input = screen.getByLabelText(/API Key/i) as HTMLInputElement;
    expect(input.type).toBe("password");
  });

  it("calls onModelChange when model is selected", async () => {
    const user = userEvent.setup();
    const handleModelChange = vi.fn();

    render(
      <AgentConfig
        apiKey=""
        model=""
        onApiKeyChange={vi.fn()}
        onModelChange={handleModelChange}
      />,
    );

    const select = screen.getByLabelText(/AI Model/i);
    await user.selectOptions(select, "gpt-4");

    expect(handleModelChange).toHaveBeenCalledWith("gpt-4");
  });

  it("displays required field errors", () => {
    render(
      <AgentConfig
        apiKey=""
        model=""
        onApiKeyChange={vi.fn()}
        onModelChange={vi.fn()}
        errors={{ apiKey: "API key is required", model: "Select an AI model" }}
      />,
    );

    expect(screen.getByText("API key is required")).toBeDefined();
    expect(screen.getByText("Select an AI model")).toBeDefined();
  });
});

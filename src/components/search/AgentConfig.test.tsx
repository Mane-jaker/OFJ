import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgentConfig } from "./AgentConfig";

describe("AgentConfig", () => {
  it("renders model selector", () => {
    render(
      <AgentConfig
        model=""
        onModelChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/Model/i)).toBeDefined();
  });

  it("calls onModelChange when model is selected", async () => {
    const user = userEvent.setup();
    const handleModelChange = vi.fn();

    render(
      <AgentConfig
        model=""
        onModelChange={handleModelChange}
      />,
    );

    const select = screen.getByLabelText(/Model/i);
    await user.selectOptions(select, "gpt-4");

    expect(handleModelChange).toHaveBeenCalledWith("gpt-4");
  });

  it("displays required field error for model", () => {
    render(
      <AgentConfig
        model=""
        onModelChange={vi.fn()}
        errors={{ model: "Select an AI model" }}
      />,
    );

    expect(screen.getByText("Select an AI model")).toBeDefined();
  });
});

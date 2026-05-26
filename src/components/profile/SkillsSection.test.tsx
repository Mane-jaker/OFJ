import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillsSection } from "./SkillsSection";

describe("SkillsSection", () => {
  it("renders existing skills as tags", () => {
    render(<SkillsSection skills={["React", "TypeScript"]} onChange={vi.fn()} />);

    expect(screen.getByText("React")).toBeDefined();
    expect(screen.getByText("TypeScript")).toBeDefined();
  });

  it("adds skill on Enter key press", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<SkillsSection skills={[]} onChange={handleChange} />);

    const input = screen.getByPlaceholderText(/Type a skill and press Enter/i);
    await user.type(input, "React{Enter}");

    expect(handleChange).toHaveBeenCalledWith(["React"]);
  });

  it("does not add duplicate skills", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<SkillsSection skills={["React"]} onChange={handleChange} />);

    const input = screen.getByPlaceholderText(/Type a skill and press Enter/i);
    await user.type(input, "React{Enter}");

    // Should not call onChange since "React" already exists
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("removes skill tag when X is clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<SkillsSection skills={["React", "TypeScript"]} onChange={handleChange} />);

    const removeButton = screen.getByLabelText(/Remove React/i);
    await user.click(removeButton);

    expect(handleChange).toHaveBeenCalledWith(["TypeScript"]);
  });
});

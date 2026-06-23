import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterChips } from "./FilterChips";

describe("FilterChips", () => {
  it("renders chip for each platform", () => {
    render(
      <FilterChips
        platforms={["linkedin", "indeed"]}
        activePlatforms={[]}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByText("linkedin")).toBeDefined();
    expect(screen.getByText("indeed")).toBeDefined();
  });

  it("toggles active state on click", async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();

    render(
      <FilterChips
        platforms={["linkedin"]}
        activePlatforms={[]}
        onToggle={handleToggle}
      />,
    );

    await user.click(screen.getByText("linkedin"));

    expect(handleToggle).toHaveBeenCalledWith("linkedin");
  });

  it("shows active chip with accent styling", () => {
    render(
      <FilterChips
        platforms={["linkedin", "indeed"]}
        activePlatforms={["linkedin"]}
        onToggle={vi.fn()}
      />,
    );

    // Active chip should use the chip-active design-system class
    const activeChip = screen.getByText("linkedin");
    expect(activeChip.className).toContain("chip-active");
  });

  it("returns null when no platforms", () => {
    const { container } = render(
      <FilterChips
        platforms={[]}
        activePlatforms={[]}
        onToggle={vi.fn()}
      />,
    );

    expect(container.innerHTML).toBe("");
  });
});

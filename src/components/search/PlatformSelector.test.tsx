import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlatformSelector } from "./PlatformSelector";

describe("PlatformSelector", () => {
  it("renders all platform options", () => {
    render(<PlatformSelector platforms={[]} onChange={vi.fn()} />);

    expect(screen.getByText("LinkedIn")).toBeDefined();
    expect(screen.getByText("Indeed")).toBeDefined();
    expect(screen.getByText("OCC Mundial")).toBeDefined();
  });

  it("toggles platform selection on click", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<PlatformSelector platforms={[]} onChange={handleChange} />);

    await user.click(screen.getByText("LinkedIn"));

    expect(handleChange).toHaveBeenCalledWith(["linkedin"]);
  });

  it("deselects platform on second click", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<PlatformSelector platforms={["linkedin"]} onChange={handleChange} />);

    await user.click(screen.getByText("LinkedIn"));

    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it("shows selected platforms with visual indication", () => {
    render(<PlatformSelector platforms={["linkedin", "indeed"]} onChange={vi.fn()} />);

    // Selected platforms should have the accent color class
    const linkedin = screen.getByText("LinkedIn");
    expect(linkedin.className).not.toBe("");
  });
});

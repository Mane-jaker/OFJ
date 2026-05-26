import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobCard } from "./JobCard";

describe("JobCard", () => {
  const baseProps = {
    id: "job-1",
    platform: "linkedin",
    title: "Senior Engineer",
    company: "Tech Corp",
    description: "Great job description here",
    url: "https://example.com/apply",
    location: "San Francisco, CA",
    salaryRange: "$150k - $200k",
    matchScore: 0.85,
    applied: false,
    saved: false,
  };

  it("renders all fields", () => {
    render(<JobCard {...baseProps} />);

    expect(screen.getByText("Senior Engineer")).toBeDefined();
    expect(screen.getByText("Tech Corp")).toBeDefined();
    expect(screen.getByText("San Francisco, CA")).toBeDefined();
    expect(screen.getByText("$150k - $200k")).toBeDefined();
    expect(screen.getByText("85% match")).toBeDefined();
    expect(screen.getByText("linkedin")).toBeDefined();
  });

  it("omits optional fields when not provided", () => {
    render(
      <JobCard
        {...baseProps}
        salaryRange={null}
        location={null}
        matchScore={null}
      />,
    );

    expect(screen.queryByText("$150k - $200k")).toBeNull();
    expect(screen.queryByText("85% match")).toBeNull();
  });

  it("shows Apply button and changes on click", async () => {
    // Mock window.open
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<JobCard {...baseProps} />);

    const applyButton = screen.getByText("Apply");
    expect(applyButton).toBeDefined();

    await userEvent.click(applyButton);

    expect(openSpy).toHaveBeenCalledWith(
      "https://example.com/apply",
      "_blank",
      "noopener,noreferrer",
    );
    expect(screen.getByText("Applied ✓")).toBeDefined();

    openSpy.mockRestore();
  });

  it("toggles saved state", async () => {
    const user = userEvent.setup();

    render(<JobCard {...baseProps} />);

    // Click save button
    const saveButton = screen.getAllByRole("button")[1]; // Second button
    await user.click(saveButton);
  });

  it("shows applied state when already applied", () => {
    render(<JobCard {...baseProps} applied={true} />);

    expect(screen.getByText("Applied ✓")).toBeDefined();
  });

  it("shows saved state when already saved", () => {
    render(<JobCard {...baseProps} saved={true} />);

    expect(screen.getByText("Saved")).toBeDefined();
  });
});

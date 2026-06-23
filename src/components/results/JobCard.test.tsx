import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobCard } from "./JobCard";

vi.mock("@/server/agent/actions", () => ({
  toggleJobFavorite: vi.fn().mockResolvedValue({ success: true, isFavorite: true }),
  markJobViewed: vi.fn().mockResolvedValue({ success: true }),
}));

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
    relevanceScore: 85,
    isViewed: false,
    isFavorite: false,
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
        relevanceScore={null}
      />,
    );

    expect(screen.queryByText("$150k - $200k")).toBeNull();
    expect(screen.queryByText("85% match")).toBeNull();
  });

  it("shows Ver vacante button and opens URL on click", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<JobCard {...baseProps} />);

    const viewButton = screen.getByText("Ver vacante");
    expect(viewButton).toBeDefined();

    await userEvent.click(viewButton);

    expect(openSpy).toHaveBeenCalledWith(
      "https://example.com/apply",
      "_blank",
      "noopener,noreferrer",
    );

    openSpy.mockRestore();
  });

  it("shows viewed badge when already viewed", () => {
    render(<JobCard {...baseProps} isViewed={true} />);

    expect(screen.getByText("Visto")).toBeDefined();
  });

  it("reduces opacity when viewed", () => {
    render(<JobCard {...baseProps} isViewed={true} />);

    const card = screen.getByText("Senior Engineer").closest("div");
    expect(card?.className).toContain("opacity-60");
  });
});

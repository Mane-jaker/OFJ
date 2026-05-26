import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createTables, getDb } from "@/server/db";
import { searches } from "@/server/db/schema";
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock server actions
const mockStartSearch = vi.fn();
vi.mock("@/server/agent/actions", () => ({
  startSearch: (...args: unknown[]) => mockStartSearch(...args),
}));

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, "sessionStorage", { value: sessionStorageMock });

import SearchPage from "./page";

describe("Search Creation (Integration)", () => {
  beforeAll(() => {
    createTables();
  });

  beforeEach(() => {
    const db = getDb();
    db.delete(searches).run();
    mockPush.mockClear();
    mockStartSearch.mockReset();
    sessionStorageMock.clear();
  });

  it("renders search page with platform selector and agent config", () => {
    render(<SearchPage />);

    expect(screen.getByText("Search Configuration")).toBeDefined();
    expect(screen.getByText(/Select Platforms/i)).toBeDefined();
    expect(screen.getByLabelText(/API Key/i)).toBeDefined();
    expect(screen.getByLabelText(/AI Model/i)).toBeDefined();
    expect(screen.getByText(/Start Search/i)).toBeDefined();
  });

  it("validates required fields before submission", async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    // Try to submit without filling fields
    await user.click(screen.getByText(/Start Search/i));

    expect(screen.getByText(/Select at least one platform/i)).toBeDefined();
    expect(screen.getByText(/API key is required/i)).toBeDefined();
    expect(screen.getByText(/Select an AI model/i)).toBeDefined();
  });

  it("creates search and navigates to results on valid submission", async () => {
    mockStartSearch.mockResolvedValue({ searchId: "test-search-1" });

    const user = userEvent.setup();
    render(<SearchPage />);

    // Select a platform
    await user.click(screen.getByText("LinkedIn"));

    // Enter API key
    await user.type(screen.getByLabelText(/API Key/i), "sk-test-key");

    // Select model
    await user.selectOptions(screen.getByLabelText(/AI Model/i), "gpt-4");

    // Submit
    await user.click(screen.getByText(/Start Search/i));

    expect(mockStartSearch).toHaveBeenCalledWith({
      platforms: ["linkedin"],
      apiKey: "sk-test-key",
      model: "gpt-4",
    });

    // Check navigation
    expect(mockPush).toHaveBeenCalledWith("/results");
  });
});

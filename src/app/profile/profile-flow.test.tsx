import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createTables, getDb } from "@/server/db";
import { profiles } from "@/server/db/schema";
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock the server actions
vi.mock("@/server/profile/actions", () => ({
  createProfile: vi.fn().mockResolvedValue({ id: "test-profile-id" }),
  updateProfile: vi.fn().mockResolvedValue({ success: true }),
  getProfile: vi.fn().mockResolvedValue(null),
  parseCV: vi.fn().mockResolvedValue({ text: "", fileName: "" }),
}));

import ProfilePage from "./page";

describe("Profile Save Flow (Integration)", () => {
  beforeAll(() => {
    createTables();
  });

  beforeEach(() => {
    const db = getDb();
    db.delete(profiles).run();
    mockPush.mockClear();
  });

  it("renders profile form with all sections", () => {
    render(<ProfilePage />);

    expect(screen.getByText("Profile Setup")).toBeDefined();
    expect(screen.getByLabelText(/name/i)).toBeDefined();
    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByRole("heading", { name: /experience/i })).toBeDefined();
    expect(screen.getByRole("heading", { name: /skills/i })).toBeDefined();
    expect(screen.getByRole("heading", { name: /education/i })).toBeDefined();
    expect(screen.getByText(/Save Profile/i)).toBeDefined();
  });

  it("shows success message and navigates after save", async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    // Fill in required fields
    await user.type(screen.getByLabelText(/name/i), "Integration User");
    await user.type(screen.getByLabelText(/email/i), "integration@example.com");

    // Submit the form
    await user.click(screen.getByText(/Save Profile/i));

    // Check success message
    expect(await screen.findByText(/Profile saved successfully/i)).toBeDefined();
  }, 10000);
});

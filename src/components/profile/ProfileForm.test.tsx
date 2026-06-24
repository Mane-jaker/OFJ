import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileForm } from "./ProfileForm";

describe("ProfileForm", () => {
  it("renders all required fields", () => {
    render(<ProfileForm onSave={vi.fn()} />);
    expect(screen.getByLabelText(/name/i)).toBeDefined();
    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByText(/Save Profile/i)).toBeDefined();
  });

  it("validates required name field", async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();

    render(<ProfileForm onSave={handleSave} />);

    await user.click(screen.getByText(/Save Profile/i));

    expect(screen.getByText("Name is required")).toBeDefined();
    expect(handleSave).not.toHaveBeenCalled();
  });

  it("validates email format", async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();

    render(<ProfileForm onSave={handleSave} />);

    await user.type(screen.getByLabelText(/name/i), "Test User");
    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.keyboard("{Enter}");

    expect(await screen.findByText(/valid email/i)).toBeDefined();
    expect(handleSave).not.toHaveBeenCalled();
  });

  it("calls onSave with form data on valid submission", async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn().mockResolvedValue(undefined);

    render(<ProfileForm onSave={handleSave} />);

    await user.type(screen.getByLabelText(/name/i), "John Doe");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.click(screen.getByText(/Save Profile/i));

    expect(handleSave).toHaveBeenCalledWith({
      name: "John Doe",
      email: "john@example.com",
      title: "",
      location: "",
      roles: [],
      salaryExpectation: "",
    });
  });

  it("shows success message after save", async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn().mockResolvedValue(undefined);

    render(<ProfileForm onSave={handleSave} />);

    await user.type(screen.getByLabelText(/name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.click(screen.getByText(/Save Profile/i));

    expect(await screen.findByText(/saved successfully/i)).toBeDefined();
  });
});

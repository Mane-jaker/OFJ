import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UploadZone } from "./UploadZone";

describe("UploadZone", () => {
  it("renders the upload area", () => {
    render(<UploadZone />);
    expect(screen.getByText(/Soltá tu CV acá o hacé clic para buscar/i)).toBeDefined();
    expect(screen.getByText(/Soporta PDF y TXT/i)).toBeDefined();
  });

  it("displays error for unsupported file type", async () => {
    render(<UploadZone />);

    const file = new File(["test"], "image.png", { type: "image/png" });
    const input = screen.getByTestId("file-input") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText(/Solo se aceptan archivos PDF y TXT/i)).toBeDefined();
  });

  it("shows file name after upload attempt", async () => {
    render(<UploadZone />);

    const file = new File(["test"], "resume.pdf", { type: "application/pdf" });
    const input = screen.getByTestId("file-input") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText("resume.pdf")).toBeDefined();
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UploadZone } from "./UploadZone";

describe("UploadZone", () => {
  const defaultProps = {
    onFileSelected: vi.fn(),
    selectedFile: null,
  };

  it("renders the upload area", () => {
    render(<UploadZone {...defaultProps} />);
    expect(
      screen.getByText(/Soltá tu CV acá o hacé clic para buscar/i),
    ).toBeDefined();
    expect(screen.getByText(/Soporta PDF y TXT/i)).toBeDefined();
  });

  it("displays error for unsupported file type", async () => {
    render(<UploadZone {...defaultProps} />);

    const file = new File(["test"], "image.png", { type: "image/png" });
    const input = screen.getByTestId("file-input") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(
      await screen.findByText(/Solo se aceptan archivos PDF y TXT/i),
    ).toBeDefined();
  });

  it("calls onFileSelected with valid PDF file", async () => {
    const onFileSelected = vi.fn();
    render(<UploadZone onFileSelected={onFileSelected} selectedFile={null} />);

    const file = new File(["test"], "resume.pdf", { type: "application/pdf" });
    const input = screen.getByTestId("file-input") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelected).toHaveBeenCalledWith(file);
  });

  it("shows selected file name when file is provided", () => {
    const file = new File(["test"], "resume.pdf", { type: "application/pdf" });
    render(<UploadZone onFileSelected={vi.fn()} selectedFile={file} />);

    expect(screen.getByText("resume.pdf")).toBeDefined();
  });
});

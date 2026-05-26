import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UploadZone } from "./UploadZone";

describe("UploadZone", () => {
  it("renders the upload area", () => {
    render(<UploadZone />);
    expect(screen.getByText(/Drop your CV here/i)).toBeDefined();
    expect(screen.getByText(/Supports PDF and text files/i)).toBeDefined();
  });

  it("displays error for unsupported file type", async () => {
    render(<UploadZone />);

    const file = new File(["test"], "image.png", { type: "image/png" });
    const input = screen.getByTestId("file-input") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText(/Only PDF and text files are accepted/i)).toBeDefined();
  });

  it("calls onFileParsed for valid text file", async () => {
    const handleParsed = vi.fn();

    render(<UploadZone onFileParsed={handleParsed} />);

    const file = new File(["Hello World"], "resume.txt", { type: "text/plain" });
    const input = screen.getByTestId("file-input") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await vi.waitFor(() => {
      expect(handleParsed).toHaveBeenCalledWith("Hello World", "resume.txt");
    });
  });

  it("shows file name after upload", async () => {
    render(<UploadZone />);

    const file = new File(["test"], "resume.pdf", { type: "application/pdf" });
    const input = screen.getByTestId("file-input") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText("resume.pdf")).toBeDefined();
  });
});
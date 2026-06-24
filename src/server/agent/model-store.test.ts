import { describe, it, expect, beforeEach } from "vitest";
import { setModel, getModel, getModelString, clearModel } from "./model-store";

describe("model-store", () => {
  beforeEach(() => {
    clearModel();
  });

  it("starts with null model", () => {
    expect(getModel()).toBeNull();
    expect(getModelString()).toBeNull();
  });

  it("stores model and returns structured values", () => {
    setModel("anthropic", "claude-3-5-sonnet-20241022");

    const model = getModel();
    expect(model).toEqual({
      providerID: "anthropic",
      modelID: "claude-3-5-sonnet-20241022",
    });
  });

  it("getModelString returns provider/model format", () => {
    setModel("openai", "gpt-4o");
    expect(getModelString()).toBe("openai/gpt-4o");
  });

  it("clearModel resets to null", () => {
    setModel("google", "gemini-2.0-flash");
    clearModel();
    expect(getModel()).toBeNull();
    expect(getModelString()).toBeNull();
  });

  it("setModel overwrites previous values", () => {
    setModel("provider-a", "model-a");
    setModel("provider-b", "model-b");

    expect(getModel()).toEqual({
      providerID: "provider-b",
      modelID: "model-b",
    });
  });
});

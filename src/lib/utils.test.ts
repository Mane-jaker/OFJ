import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn() utility", () => {
  it("merges class names", () => {
    const result = cn("foo", "bar");
    expect(result).toBe("foo bar");
  });

  it("handles falsy values", () => {
    const result = cn("foo", false, null, undefined, 0, "bar");
    expect(result).toBe("foo bar");
  });

  it("handles conditional objects", () => {
    const result = cn("base", { active: true, hidden: false });
    expect(result).toBe("base active");
  });

  it("deduplicates tailwind classes", () => {
    const result = cn("px-4", "px-6");
    // tailwind-merge keeps the last conflicting class
    expect(result).toBe("px-6");
  });

  it("returns empty string for no inputs", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("handles nested arrays", () => {
    const result = cn(["foo", "bar"], "baz");
    expect(result).toBe("foo bar baz");
  });
});

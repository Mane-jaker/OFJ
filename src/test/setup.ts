import "@testing-library/jest-dom/vitest";

// Extend Vitest matchers with jest-dom
import { expect } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

// Polyfill Blob.text() for jsdom (missing in jsdom < v26)
if (!Blob.prototype.text) {
  Blob.prototype.text = function () {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(this);
    });
  };
}

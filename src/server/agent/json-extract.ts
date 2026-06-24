export function extractJson(text: string): unknown {
  const trimmed = text.trim();

  const codeBlockMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {}
  }

  if (
    trimmed.startsWith("[") ||
    trimmed.startsWith("{") ||
    trimmed.startsWith('"')
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {}
  }

  const firstBrace = trimmed.indexOf("{");
  const firstBracket = trimmed.indexOf("[");
  const start =
    firstBrace === -1
      ? firstBracket
      : firstBracket === -1
        ? firstBrace
        : Math.min(firstBrace, firstBracket);

  if (start !== -1) {
    for (let depth = 0, i = start; i < trimmed.length; i++) {
      if (trimmed[i] === "{" || trimmed[i] === "[") depth++;
      else if (trimmed[i] === "}" || trimmed[i] === "]") depth--;
      if (depth === 0) {
        try {
          return JSON.parse(trimmed.slice(start, i + 1));
        } catch {}
        break;
      }
    }
  }

  throw new Error("Could not extract valid JSON from agent response");
}

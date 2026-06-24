import type { Experience, Education } from "@/server/db/schema";

export interface ParsedCVLegacy {
  name: string | null;
  email: string | null;
  title: string | null;
  location: string | null;
  skills: string[];
  experience: Experience[];
  education: Education[];
}

function extractEmail(text: string): string | null {
  const re = /[\w.-]+@[\w.-]+\.\w{2,}/i;
  const match = text.match(re);
  return match?.[0] ?? null;
}

function extractName(text: string): string | null {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;
  const first = lines[0];
  if (first.length > 3 && first.length < 60 && !first.includes("@")) {
    return first;
  }
  for (const line of lines.slice(0, 5)) {
    if (line.length > 3 && line.length < 60 && !line.includes("@")) {
      return line;
    }
  }
  return null;
}

function extractTitle(text: string): string | null {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  for (let i = 1; i < Math.min(lines.length, 10); i++) {
    const re = /^(senior|junior|lead|principal|staff|mid|sr\.?|jr\.?|frontend|backend|full.?stack|devops|sre|engineer|developer|architect|manager|director|analyst|specialist|consultant)/i;
    if (re.test(lines[i]) && lines[i].length < 80) {
      return lines[i];
    }
  }
  return null;
}

function extractLocation(text: string): string | null {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const locationLine = lines.slice(0, 15).find((line) => {
    const hasCity = /^(?:remote|hybrid|onsite|relocate|[A-Z][a-z]+(?:,\s*[A-Z][a-z]+)?(?:\s*\d{4,5})?)$/i.test(line.trim());
    const hasEmail = line.includes("@");
    return hasCity && !hasEmail;
  });
  return locationLine ?? null;
}

function extractSkills(text: string): string[] {
  const section = extractSection(text, [
    /skills?/i,
    /technologies?/i,
    /tech stack/i,
    /competencias/i,
    /habilidades/i,
    /herramientas/i,
  ]);
  const content = section ?? text;
  const items = content
    .split(/[,;\n|•\-–—]/)
    .map((s) => s.trim().replace(/^[-*•]\s*/, ""))
    .filter((s) => s.length > 1 && s.length < 50);
  return [...new Set(items)];
}

function extractExperience(text: string): Experience[] {
  const section = extractSection(text, [
    /experience/i,
    /work experience/i,
    /employment/i,
    /work history/i,
    /professional experience/i,
    /experiencia/i,
    /laboral/i,
  ]);
  if (!section) return [];

  const entries: Experience[] = [];
  const blocks = section.split(/\n\s*\n/).filter(Boolean);

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    const title = lines[0];
    const company = lines[1] ?? "";
    const dateMatch = block.match(
      /(\d{4})\s*[-–—toa]+\s*(\d{4}|present|actual|current)/i,
    );
    const singleDate = block.match(/(\d{4})/);

    entries.push({
      company,
      title,
      startDate: dateMatch?.[1] ?? singleDate?.[1] ?? "",
      endDate: dateMatch?.[2] ?? undefined,
      description: lines.slice(2).join("\n") || undefined,
    });
  }

  return entries;
}

function extractEducation(text: string): Education[] {
  const section = extractSection(text, [
    /education/i,
    /academic/i,
    /formaci[óo]n/i,
    /educaci[óo]n/i,
    /estudios/i,
  ]);
  if (!section) return [];

  const entries: Education[] = [];
  const blocks = section.split(/\n\s*\n/).filter(Boolean);

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    const degree = lines[0];
    const institution = lines[1] ?? "";
    const yearMatch = block.match(/(\d{4})/);

    entries.push({
      institution,
      degree,
      field: lines.slice(2).join(" ") || "",
      startYear: yearMatch ? Number(yearMatch[1]) : 0,
      endYear: undefined,
    });
  }

  return entries;
}

function extractSection(
  text: string,
  headers: RegExp[],
): string | null {
  const lines = text.split("\n");
  let start = -1;

  for (let i = 0; i < lines.length; i++) {
    for (const re of headers) {
      if (re.test(lines[i].trim())) {
        start = i + 1;
        break;
      }
    }
    if (start !== -1) break;
  }

  if (start === -1) return null;

  const nextSectionRe = /^(?:education|experience|skills?|projects?|certifications?|languages?|references?|summary|profile)/i;
  const end = lines
    .slice(start)
    .findIndex(
      (line, idx) =>
        idx > 2 && nextSectionRe.test(line.trim()) && lines[start + idx - 1].trim() === "",
    );

  const sectionLines = end === -1 ? lines.slice(start) : lines.slice(start, start + end);
  return sectionLines.join("\n").trim();
}

export function regexParseCVText(text: string): ParsedCVLegacy {
  return {
    name: extractName(text),
    email: extractEmail(text),
    title: extractTitle(text),
    location: extractLocation(text),
    skills: extractSkills(text),
    experience: extractExperience(text),
    education: extractEducation(text),
  };
}

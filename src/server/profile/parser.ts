import { runAgent } from "@/server/agent/runner";
import { type AgentRunOutput } from "@/server/agent/runner";
import { regexParseCVText, type ParsedCVLegacy } from "./parser.regex-fallback";
import type { Experience, Education } from "@/server/db/schema";

export interface ParsedCV {
  name: string | null;
  email: string | null;
  title: string | null;
  location: string | null;
  skills: string[];
  experience: Experience[];
  education: Education[];
  parseSource: "harness" | "regex-fallback";
}

interface HarnessOutput {
  name?: string | null;
  email?: string | null;
  title?: string | null;
  location?: string | null;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
}

function isHarnessOutput(data: unknown): data is HarnessOutput {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  if (d.skills !== undefined && !Array.isArray(d.skills)) return false;
  if (d.experience !== undefined && !Array.isArray(d.experience)) return false;
  if (d.education !== undefined && !Array.isArray(d.education)) return false;
  return true;
}

export async function parseCVText(text: string): Promise<ParsedCV> {
  if (!text?.trim()) {
    return {
      name: null,
      email: null,
      title: null,
      location: null,
      skills: [],
      experience: [],
      education: [],
      parseSource: "regex-fallback",
    };
  }

  try {
    const result: AgentRunOutput = await runAgent("ofj-parse-cv", {
      cvText: text,
    });

    if (result.success && isHarnessOutput(result.data)) {
      return {
        name: result.data.name ?? null,
        email: result.data.email ?? null,
        title: result.data.title ?? null,
        location: result.data.location ?? null,
        skills: (result.data.skills ?? []).slice(0, 30),
        experience: result.data.experience ?? [],
        education: result.data.education ?? [],
        parseSource: "harness",
      };
    }
  } catch {
    // Fallback below
  }

  const fallback: ParsedCVLegacy = regexParseCVText(text);
  return {
    name: fallback.name,
    email: fallback.email,
    title: fallback.title,
    location: fallback.location,
    skills: fallback.skills,
    experience: fallback.experience,
    education: fallback.education,
    parseSource: "regex-fallback",
  };
}

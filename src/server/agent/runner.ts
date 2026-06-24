import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getConnection, isConnected } from "./connection";
import { getModel } from "./model-store";
import { extractJson } from "./json-extract";

export type AgentSkill = "ofj-search" | "ofj-generate-cv" | "ofj-parse-cv";

export interface AgentRunInput {
  skill: AgentSkill;
  input: Record<string, unknown>;
}

export interface AgentRunOutput {
  success: boolean;
  data?: unknown;
  error?: string;
  durationMs: number;
}

const SKILLS_DIR = resolve(process.cwd(), "skills");

function readSkillContent(skill: AgentSkill): string {
  const path = resolve(SKILLS_DIR, `${skill}.md`);
  return readFileSync(path, "utf-8");
}

function buildSystemPrompt(skill: AgentSkill, skillContent: string): string {
  const userInputPlaceholder = "## Input\n\nJSON with the following fields:";
  const additional = `\n\n## Important\n\nYou MUST respond with ONLY valid JSON matching the output format described above. No markdown fences, no extra text, no explanations.`;

  if (skillContent.includes(userInputPlaceholder)) {
    return skillContent.replace(
      /## Input[\s\S]*?(?=## Output|## Rules|$)/,
      additional + "\n\n",
    );
  }

  return skillContent + additional;
}

function buildUserPrompt(input: Record<string, unknown>): string {
  return JSON.stringify(input, null, 2);
}

export async function runAgent(
  skill: AgentSkill,
  input: Record<string, unknown>,
): Promise<AgentRunOutput> {
  const start = Date.now();

  if (process.env.OFJ_DRY_RUN === "true") {
    const mock = skill === "ofj-search"
      ? [
          {
            title: "Senior Frontend Developer",
            company: "Tech Corp",
            location: "Remote",
            url: "https://linkedin.com/jobs/view/mock-1",
            platform: "linkedin",
            description:
              "We are looking for a Senior Frontend Developer with React and TypeScript experience to build modern web applications...",
            postedDate: new Date().toISOString().slice(0, 10),
            relevanceScore: 85,
          },
        ]
      : {
          tailoredSummary:
            "Frontend engineer with 5+ years building accessible React applications.",
          tailoredSkills: ["React", "TypeScript", "Next.js"],
          tailoredExperience: [
            {
              title: "Senior Frontend Developer",
              company: "Acme",
              dates: "Jan 2022 – Present",
              bullets: [
                "Led migration to Next.js App Router, cutting load times by 35%.",
              ],
            },
          ],
        };
    return { success: true, data: mock, durationMs: Date.now() - start };
  }

  if (!isConnected()) {
    return {
      success: false,
      error:
        "No hay un agent conectado. Conectá OpenCode desde el header para buscar empleos.",
      durationMs: Date.now() - start,
    };
  }

  const model = getModel();
  if (!model) {
    return {
      success: false,
      error:
        "No hay un modelo seleccionado. Seleccioná un modelo desde el header.",
      durationMs: Date.now() - start,
    };
  }

  const conn = getConnection()!;

  try {
    const skillContent = readSkillContent(skill);
    const systemPrompt = buildSystemPrompt(skill, skillContent);
    const userPrompt = buildUserPrompt(input);

    const sessionResponse = await conn.client.session.create({
      body: { title: `OFJ: ${skill}` },
    });
    const sessionId = (sessionResponse.data as any)?.id;
    if (!sessionId) {
      return {
        success: false,
        error: "Failed to create session",
        durationMs: Date.now() - start,
      };
    }

    const promptBody: any = {
      model: { providerID: model.providerID, modelID: model.modelID },
      system: systemPrompt,
      parts: [{ type: "text" as const, text: userPrompt }],
    };

    const result = await conn.client.session.prompt({
      path: { id: sessionId },
      body: promptBody,
    });

    const responseData = result.data as any;
    let outputText = "";

    if (responseData?.info?.structured_output) {
      return {
        success: true,
        data: responseData.info.structured_output,
        durationMs: Date.now() - start,
      };
    }

    if (responseData?.info?.error) {
      return {
        success: false,
        error: `Agent error: ${responseData.info.error.message || responseData.info.error.name}`,
        durationMs: Date.now() - start,
      };
    }

    const parts = (responseData?.parts ?? []) as Array<any>;
    for (const part of parts) {
      if (part.type === "text" && part.text) {
        outputText += part.text;
      } else if (part.type === "tool" && part.state === "completed") {
        const content = part.content ?? part.result ?? "";
        if (typeof content === "string") outputText += content;
      }
    }

    if (!outputText.trim()) {
      return {
        success: false,
        error: "Agent produced no output",
        durationMs: Date.now() - start,
      };
    }

    const data = extractJson(outputText);
    return { success: true, data, durationMs: Date.now() - start };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Agent run failed unexpectedly",
      durationMs: Date.now() - start,
    };
  }
}

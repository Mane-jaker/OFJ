import { spawn } from "node:child_process";

export type AgentSkill = "ofj-search" | "ofj-generate-cv";

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

const TIMEOUT_MS = 300_000;

interface Vacancy {
  title: string;
  company: string;
  location: string;
  url: string;
  platform: string;
  description: string;
  postedDate: string;
  relevanceScore: number;
}

function dryRunMock(skill: AgentSkill): unknown {
  if (skill === "ofj-search") {
    const vacancies: Vacancy[] = [
      {
        title: "Senior Frontend Developer",
        company: "Tech Corp",
        location: "Remote",
        url: "https://linkedin.com/jobs/view/mock-1",
        platform: "linkedin",
        description:
          "We are looking for a Senior Frontend Developer with React and TypeScript experience to build modern web applications...",
        postedDate: "2026-06-22",
        relevanceScore: 85,
      },
      {
        title: "Full Stack Engineer",
        company: "Innovate Labs",
        location: "Remote, EU",
        url: "https://linkedin.com/jobs/view/mock-2",
        platform: "linkedin",
        description:
          "Join our team as a Full Stack Engineer working with Next.js, Node.js, and modern cloud infrastructure...",
        postedDate: "2026-06-22",
        relevanceScore: 78,
      },
      {
        title: "React Engineer",
        company: "Globex",
        location: "Berlin, Germany",
        url: "https://linkedin.com/jobs/view/mock-3",
        platform: "linkedin",
        description:
          "Globex is hiring a React Engineer to craft delightful user experiences with React 19 and the latest tooling...",
        postedDate: "2026-06-21",
        relevanceScore: 92,
      },
    ];
    return vacancies;
  }

  return {
    tailoredSummary:
      "Frontend engineer with 5+ years building accessible React applications.",
    tailoredSkills: ["React", "TypeScript", "Next.js", "Node.js"],
    tailoredExperience: [
      {
        title: "Senior Frontend Developer",
        company: "Acme",
        dates: "Jan 2022 – Present",
        bullets: [
          "Led migration to Next.js App Router, cutting load times by 35%.",
          "Mentored 4 engineers on testing and accessibility best practices.",
        ],
      },
    ],
  };
}

export async function runAgent(
  skill: AgentSkill,
  input: Record<string, unknown>,
): Promise<AgentRunOutput> {
  const start = Date.now();

  if (process.env.OFJ_DRY_RUN === "true") {
    return {
      success: true,
      data: dryRunMock(skill),
      durationMs: Date.now() - start,
    };
  }

  return new Promise<AgentRunOutput>((resolve) => {
    const args = ["run", skill, "--input", JSON.stringify(input)];
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let settled = false;

    const child = spawn("opencode", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, TIMEOUT_MS);

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        success: false,
        error: err.message,
        durationMs: Date.now() - start,
      });
    });

    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);

      const durationMs = Date.now() - start;

      if (timedOut) {
        resolve({
          success: false,
          error: `Agent timed out after ${TIMEOUT_MS}ms`,
          durationMs,
        });
        return;
      }

      if (code !== 0) {
        resolve({
          success: false,
          error: stderr.trim() || `Agent exited with code ${code}`,
          durationMs,
        });
        return;
      }

      const trimmed = stdout.trim();
      if (!trimmed) {
        resolve({
          success: false,
          error: "Agent produced no output",
          durationMs,
        });
        return;
      }

      try {
        const data = JSON.parse(trimmed);
        resolve({ success: true, data, durationMs });
      } catch (err) {
        resolve({
          success: false,
          error:
            err instanceof Error
              ? `Failed to parse agent output: ${err.message}`
              : "Failed to parse agent output",
          durationMs,
        });
      }
    });
  });
}
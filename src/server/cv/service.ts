import { eq } from "drizzle-orm";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getDb } from "@/server/db";
import {
  generatedCvs,
  jobListings,
  type TailoredExperience,
} from "@/server/db/schema";
import { getProfile, type Profile } from "@/server/profile/service";
import { runAgent } from "@/server/agent/runner";
import { CVDocument } from "@/components/cv/CVDocument";
import { nanoid } from "nanoid";

export interface GenerateCVOptions {
  profileId: string;
  jobListingId?: string;
  jobTitle?: string;
  jobDescription?: string;
}

export async function generateCVContent(
  profile: Profile,
  options?: { jobTitle?: string; jobDescription?: string },
): Promise<string> {
  const sections: string[] = [];

  // Header
  sections.push(`${profile.name.toUpperCase()}`);
  if (profile.title) sections.push(profile.title);
  if (profile.location) sections.push(profile.location);
  sections.push(`Email: ${profile.email}`);
  sections.push("");

  // Professional Summary (from CV text or title)
  if (profile.cvText) {
    sections.push("PROFESSIONAL SUMMARY");
    sections.push(
      profile.cvText.substring(0, 500) +
        (profile.cvText.length > 500 ? "..." : ""),
    );
    sections.push("");
  }

  // If tailored to a job, add a note
  if (options?.jobTitle) {
    sections.push(`TARGET ROLE: ${options.jobTitle}`);
    sections.push(
      `CV tailored for the ${options.jobTitle} position based on matching skills and experience.`,
    );
    sections.push("");
  }

  // Skills
  if (profile.skills && profile.skills.length > 0) {
    sections.push("SKILLS");
    sections.push(profile.skills.join(", "));
    sections.push("");
  }

  // Experience
  if (profile.experience && profile.experience.length > 0) {
    sections.push("EXPERIENCE");
    for (const exp of profile.experience) {
      const dates = exp.endDate
        ? `${exp.startDate} - ${exp.endDate}`
        : `${exp.startDate} - Present`;
      sections.push(`${exp.title} at ${exp.company} (${dates})`);
      if (exp.description) {
        sections.push(`  ${exp.description}`);
      }
      sections.push("");
    }
  }

  // Education
  if (profile.education && profile.education.length > 0) {
    sections.push("EDUCATION");
    for (const edu of profile.education) {
      const years = edu.endYear
        ? `${edu.startYear} - ${edu.endYear}`
        : `${edu.startYear} - Present`;
      sections.push(
        `${edu.degree} in ${edu.field}, ${edu.institution} (${years})`,
      );
    }
    sections.push("");
  }

  return sections.join("\n");
}

export async function saveCV(data: {
  profileId: string;
  jobListingId?: string;
  content: string;
  filePath?: string;
}): Promise<{ id: string }> {
  const db = getDb();
  const id = nanoid();
  const now = new Date();

  db.insert(generatedCvs)
    .values({
      id,
      profileId: data.profileId,
      jobListingId: data.jobListingId ?? null,
      content: data.content,
      filePath: data.filePath ?? null,
      createdAt: now,
    })
    .run();

  return { id };
}

export async function getCV(id: string) {
  const db = getDb();
  const result = db
    .select()
    .from(generatedCvs)
    .where(eq(generatedCvs.id, id))
    .get();

  return result ?? null;
}

export async function getCVsByProfile(profileId: string) {
  const db = getDb();
  return db
    .select()
    .from(generatedCvs)
    .where(eq(generatedCvs.profileId, profileId))
    .all();
}

export interface GeneratedCVResult {
  id: string;
  profileId: string;
  jobListingId: string;
  tailoredSummary: string;
  tailoredSkills: string[];
  tailoredExperience: TailoredExperience[];
  filePath: string;
}

function getCacheDir(): string {
  return path.join(os.homedir(), ".ofj", "cache");
}

function getCacheFilePath(jobListingId: string): string {
  return path.join(getCacheDir(), `cv-${jobListingId}.pdf`);
}

function ensureCacheDir(): void {
  fs.mkdirSync(getCacheDir(), { recursive: true });
}

interface AgentTailoredOutput {
  tailoredSummary: string;
  tailoredSkills: string[];
  tailoredExperience: TailoredExperience[];
}

function isTailoredOutput(data: unknown): data is AgentTailoredOutput {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.tailoredSummary === "string" &&
    Array.isArray(d.tailoredSkills) &&
    Array.isArray(d.tailoredExperience)
  );
}

async function renderPdfToCache(
  jobListingId: string,
  props: AgentTailoredOutput & { name: string },
): Promise<string> {
  ensureCacheDir();
  const filePath = getCacheFilePath(jobListingId);
  const element = createElement(CVDocument, props);
  const buffer = await renderToBuffer(
    element as unknown as Parameters<typeof renderToBuffer>[0],
  );
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

export async function generateCv(
  profileId: string,
  jobListingId: string,
): Promise<GeneratedCVResult> {
  const db = getDb();

  const profile = await getProfile(profileId);
  if (!profile) {
    throw new Error("Profile not found");
  }

  const listing = db
    .select()
    .from(jobListings)
    .where(eq(jobListings.id, jobListingId))
    .get();

  if (!listing) {
    throw new Error("Job listing not found");
  }

  const cacheFilePath = getCacheFilePath(jobListingId);

  // Cache hit: existing DB record + file on disk
  const existing = db
    .select()
    .from(generatedCvs)
    .where(eq(generatedCvs.jobListingId, jobListingId))
    .get();

  if (existing && existing.filePath && fs.existsSync(existing.filePath)) {
    return {
      id: existing.id,
      profileId: existing.profileId,
      jobListingId,
      tailoredSummary: existing.tailoredSummary ?? "",
      tailoredSkills: (existing.tailoredSkills as string[]) ?? [],
      tailoredExperience:
        (existing.tailoredExperience as TailoredExperience[]) ?? [],
      filePath: existing.filePath,
    };
  }

  // Cache miss: run the agent
  const agentInput = {
    profile: {
      name: profile.name,
      summary: profile.cvText ?? profile.title ?? "",
      skills: profile.skills,
      experience: (profile.experience ?? []).map((exp) => ({
        title: exp.title,
        company: exp.company,
        dates: exp.endDate
          ? `${exp.startDate} - ${exp.endDate}`
          : `${exp.startDate} - Present`,
        bullets: exp.description ? [exp.description] : [],
      })),
    },
    jobDescription: listing.description ?? "",
  };

  const run = await runAgent("ofj-generate-cv", agentInput);
  if (!run.success || !isTailoredOutput(run.data)) {
    throw new Error(run.error ?? "Agent failed to produce tailored CV");
  }

  const tailored = run.data;
  const content = JSON.stringify(tailored);

  const filePath = await renderPdfToCache(jobListingId, {
    name: profile.name,
    ...tailored,
  });

  if (existing) {
    db.update(generatedCvs)
      .set({
        content,
        tailoredSummary: tailored.tailoredSummary,
        tailoredSkills: tailored.tailoredSkills,
        tailoredExperience: tailored.tailoredExperience,
        filePath,
      })
      .where(eq(generatedCvs.id, existing.id))
      .run();

    return {
      id: existing.id,
      profileId: existing.profileId,
      jobListingId,
      ...tailored,
      filePath,
    };
  }

  const id = nanoid();
  db.insert(generatedCvs)
    .values({
      id,
      profileId,
      jobListingId,
      content,
      tailoredSummary: tailored.tailoredSummary,
      tailoredSkills: tailored.tailoredSkills,
      tailoredExperience: tailored.tailoredExperience,
      filePath,
      createdAt: new Date(),
    })
    .run();

  return {
    id,
    profileId,
    jobListingId,
    ...tailored,
    filePath,
  };
}

export async function getCvByJobListing(
  jobListingId: string,
): Promise<{ exists: boolean; filePath?: string }> {
  const db = getDb();
  const record = db
    .select()
    .from(generatedCvs)
    .where(eq(generatedCvs.jobListingId, jobListingId))
    .get();

  if (!record) return { exists: false };

  // If file missing but record exists, signal that regeneration is needed
  if (!record.filePath || !fs.existsSync(record.filePath)) {
    return { exists: false };
  }

  return { exists: true, filePath: record.filePath };
}

export async function getCvBuffer(
  jobListingId: string,
): Promise<Buffer | null> {
  const status = await getCvByJobListing(jobListingId);
  if (!status.exists || !status.filePath) return null;
  return fs.readFileSync(status.filePath);
}

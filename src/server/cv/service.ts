import { eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { generatedCvs } from "@/server/db/schema";
import type { Profile } from "@/server/profile/service";
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

"use server";

import { getFirstProfile } from "@/server/profile/service";
import {
  generateCv as generateCvService,
  getCvByJobListing,
  getCvBuffer,
} from "./service";
import { getDb } from "@/server/db";
import { generatedCvs } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function generateCv(
  jobListingId: string,
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    const profile = await getFirstProfile();
    if (!profile) {
      return { success: false, error: "No profile found" };
    }

    const result = await generateCvService(profile.id, jobListingId);

    return { success: true, filePath: result.filePath };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate CV",
    };
  }
}

export async function getCvStatus(
  jobListingId: string,
): Promise<{ exists: boolean; filePath?: string }> {
  try {
    return await getCvByJobListing(jobListingId);
  } catch {
    return { exists: false };
  }
}

export async function downloadCv(
  jobListingId: string,
): Promise<{ success: boolean; data?: Uint8Array; error?: string }> {
  try {
    const buffer = await getCvBuffer(jobListingId);
    if (!buffer) {
      return { success: false, error: "CV not found" };
    }

    return {
      success: true,
      data: new Uint8Array(buffer),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to download CV",
    };
  }
}

export async function getCvTailoredData(
  jobListingId: string,
): Promise<{
  success: boolean;
  name?: string;
  tailoredSummary?: string;
  tailoredSkills?: string[];
  tailoredExperience?: Array<{
    title: string;
    company: string;
    dates: string;
    bullets: string[];
  }>;
  error?: string;
}> {
  try {
    const db = getDb();
    const record = db
      .select()
      .from(generatedCvs)
      .where(eq(generatedCvs.jobListingId, jobListingId))
      .get();

    if (!record) {
      return { success: false, error: "CV not found" };
    }

    const profile = await getFirstProfile();

    return {
      success: true,
      name: profile?.name ?? "",
      tailoredSummary: record.tailoredSummary ?? "",
      tailoredSkills: (record.tailoredSkills as string[]) ?? [],
      tailoredExperience:
        (record.tailoredExperience as Array<{
          title: string;
          company: string;
          dates: string;
          bullets: string[];
        }>) ?? [],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load CV",
    };
  }
}

"use server";

import { getProfile } from "@/server/profile/service";
import { generateCVContent, saveCV as saveCVService } from "./service";

export async function generateCV(
  profileId: string,
  jobListingId?: string,
): Promise<{ content: string; error?: string }> {
  try {
    const profile = await getProfile(profileId);
    if (!profile) {
      return { content: "", error: "Profile not found" };
    }

    // Fetch job details if targeting a specific listing
    let jobTitle: string | undefined;
    let jobDescription: string | undefined;

    if (jobListingId) {
      const { getDb } = await import("@/server/db");
      const { jobListings } = await import("@/server/db/schema");
      const { eq } = await import("drizzle-orm");

      const listing = getDb()
        .select()
        .from(jobListings)
        .where(eq(jobListings.id, jobListingId))
        .get();

      if (listing) {
        jobTitle = listing.title;
        jobDescription = listing.description ?? undefined;
      }
    }

    const content = await generateCVContent(profile, {
      jobTitle,
      jobDescription,
    });

    return { content };
  } catch (error) {
    return {
      content: "",
      error: error instanceof Error ? error.message : "Failed to generate CV",
    };
  }
}

export async function saveCV(data: {
  profileId: string;
  jobListingId?: string;
  content: string;
}): Promise<{ id: string; error?: string }> {
  try {
    const result = await saveCVService(data);
    return result;
  } catch (error) {
    return {
      id: "",
      error: error instanceof Error ? error.message : "Failed to save CV",
    };
  }
}

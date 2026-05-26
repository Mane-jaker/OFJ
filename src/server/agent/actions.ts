"use server";

import {
  createSearch as createSearchService,
  getSearchStatus as getSearchStatusService,
  getSearchById,
  getJobListings,
  updateSearchStatus,
} from "./service";

export async function startSearch(data: {
  platforms: string[];
  apiKey: string;
  model: string;
}): Promise<{ searchId: string; error?: string }> {
  try {
    const result = await createSearchService({
      platforms: data.platforms,
      apiKey: data.apiKey,
      model: data.model,
    });
    return { searchId: result.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to start search";
    return { searchId: "", error: message };
  }
}

export async function getSearchStatus(searchId: string): Promise<{
  status: string;
  resultsCount: number;
  error?: string;
}> {
  try {
    const result = await getSearchStatusService(searchId);
    if (!result) {
      return { status: "not_found", resultsCount: 0 };
    }
    return { status: result.status, resultsCount: result.resultsCount ?? 0 };
  } catch (error) {
    return {
      status: "error",
      resultsCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getSearchWithResults(searchId: string) {
  try {
    const search = await getSearchById(searchId);
    if (!search) return null;

    const listings = await getJobListings(searchId);

    return {
      search,
      listings,
    };
  } catch {
    return null;
  }
}

export async function markJobApplied(jobId: string): Promise<{ success: boolean }> {
  try {
    const db = (await import("@/server/db")).getDb();
    const { jobListings } = await import("@/server/db/schema");
    const { eq } = await import("drizzle-orm");

    db.update(jobListings)
      .set({ applied: 1 })
      .where(eq(jobListings.id, jobId));

    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function toggleJobSaved(jobId: string): Promise<{ success: boolean; saved: boolean }> {
  try {
    const db = (await import("@/server/db")).getDb();
    const { jobListings } = await import("@/server/db/schema");
    const { eq } = await import("drizzle-orm");

    const current = db
      .select({ saved: jobListings.saved })
      .from(jobListings)
      .where(eq(jobListings.id, jobId))
      .get();

    const newSaved = current?.saved ? 0 : 1;

    db.update(jobListings)
      .set({ saved: newSaved })
      .where(eq(jobListings.id, jobId));

    return { success: true, saved: !!newSaved };
  } catch {
    return { success: false, saved: false };
  }
}

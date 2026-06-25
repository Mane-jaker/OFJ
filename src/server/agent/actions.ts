"use server";

import {
  createSearch as createSearchService,
  getSearchStatus as getSearchStatusService,
  getSearchById,
  getJobListings,
  executeSearch,
} from "./service";

export async function startSearch(data: {
  platforms: string[];
  searchTerms?: string[];
  model?: string;
  maxResults?: number;
}): Promise<{ searchId: string; error?: string }> {
  try {
    const result = await createSearchService({
      platforms: data.platforms,
      searchTerms: data.searchTerms,
      model: data.model,
      filters: data.maxResults ? { maxResults: data.maxResults } : undefined,
    });

    const run = await executeSearch(result.id, data.maxResults);
    if (!run.success) {
      return { searchId: result.id, error: run.error };
    }

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
    return {
      status: result.status,
      resultsCount: result.resultsCount ?? 0,
      error: result.errorMessage,
    };
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

export async function markJobViewed(jobId: string): Promise<{ success: boolean }> {
  try {
    const db = (await import("@/server/db")).getDb();
    const { jobListings } = await import("@/server/db/schema");
    const { eq } = await import("drizzle-orm");

    db.update(jobListings)
      .set({ isViewed: 1 })
      .where(eq(jobListings.id, jobId));

    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function toggleJobFavorite(jobId: string): Promise<{ success: boolean; isFavorite: boolean }> {
  try {
    const db = (await import("@/server/db")).getDb();
    const { jobListings } = await import("@/server/db/schema");
    const { eq } = await import("drizzle-orm");

    const current = db
      .select({ isFavorite: jobListings.isFavorite })
      .from(jobListings)
      .where(eq(jobListings.id, jobId))
      .get();

    const newFavorite = current?.isFavorite ? 0 : 1;

    db.update(jobListings)
      .set({ isFavorite: newFavorite })
      .where(eq(jobListings.id, jobId));

    return { success: true, isFavorite: !!newFavorite };
  } catch {
    return { success: false, isFavorite: false };
  }
}

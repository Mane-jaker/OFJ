import { eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { searches, jobListings, profiles } from "@/server/db/schema";
import { nanoid } from "nanoid";

export interface CreateSearchData {
  profileId?: string;
  platforms: string[];
  apiKey: string;
  model: string;
  filters?: Record<string, unknown>;
}

export interface SearchResult {
  id: string;
  profileId: string;
  status: "pending" | "running" | "completed" | "failed";
  platforms: string[];
  apiKey: string | null;
  model: string | null;
  filters: Record<string, unknown>;
  resultsCount: number | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

export async function createSearch(
  data: CreateSearchData,
): Promise<{ id: string }> {
  const db = getDb();
  const id = nanoid();
  const now = new Date();

  // Use first profile as default if no profileId provided
  const profileId =
    data.profileId ||
    db.select({ id: profiles.id }).from(profiles).get()?.id ||
    "default";

  db.insert(searches)
    .values({
      id,
      profileId,
      status: "pending",
      platforms: data.platforms,
      apiKey: data.apiKey,
      model: data.model,
      filters: data.filters ?? {},
      resultsCount: 0,
      createdAt: now,
    })
    .run();

  return { id };
}

export async function getSearchStatus(
  searchId: string,
): Promise<{ status: string; resultsCount: number } | null> {
  const db = getDb();
  const result = db
    .select({
      status: searches.status,
      resultsCount: searches.resultsCount,
    })
    .from(searches)
    .where(eq(searches.id, searchId))
    .get();

  if (!result) return null;
  return { status: result.status, resultsCount: result.resultsCount ?? 0 };
}

export async function updateSearchStatus(
  searchId: string,
  status: "pending" | "running" | "completed" | "failed",
): Promise<void> {
  const db = getDb();
  const now = new Date();

  const updates: Record<string, unknown> = { status };

  if (status === "running") {
    updates.startedAt = now;
  }

  if (status === "completed" || status === "failed") {
    updates.completedAt = now;
  }

  db.update(searches)
    .set(updates)
    .where(eq(searches.id, searchId))
    .run();
}

export async function getSearchById(
  searchId: string,
): Promise<SearchResult | null> {
  const db = getDb();
  const result = db
    .select()
    .from(searches)
    .where(eq(searches.id, searchId))
    .get();

  if (!result) return null;

  return {
    ...result,
    platforms: result.platforms as string[],
    filters: result.filters as Record<string, unknown>,
  };
}

export interface JobListingResult {
  id: string;
  platform: string;
  title: string;
  company: string;
  description: string | null;
  url: string | null;
  location: string | null;
  salaryRange: string | null;
  matchScore: number | null;
  applied: number | null;
  saved: number | null;
  createdAt: Date;
  searchId: string;
}

export async function getJobListings(
  searchId: string,
): Promise<JobListingResult[]> {
  const db = getDb();
  return db
    .select()
    .from(jobListings)
    .where(eq(jobListings.searchId, searchId))
    .all();
}

import { eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { searches, jobListings, profiles } from "@/server/db/schema";
import type { Experience } from "@/server/db/schema";
import { nanoid } from "nanoid";
import { runAgent } from "./runner";

export interface CreateSearchData {
  profileId?: string;
  platforms: string[];
  searchTerms?: string[];
  model?: string;
  filters?: Record<string, unknown>;
}

export interface SearchResult {
  id: string;
  profileId: string;
  status: "pending" | "running" | "completed" | "failed";
  platforms: string[];
  searchTerms: string[];
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
      searchTerms: data.searchTerms ?? [],
      model: data.model ?? null,
      filters: data.filters ?? {},
      resultsCount: 0,
      createdAt: now,
    })
    .run();

  return { id };
}

export async function getSearchStatus(
  searchId: string,
): Promise<{
  status: string;
  resultsCount: number;
  errorMessage?: string;
} | null> {
  const db = getDb();
  const result = db
    .select({
      status: searches.status,
      resultsCount: searches.resultsCount,
      filters: searches.filters,
    })
    .from(searches)
    .where(eq(searches.id, searchId))
    .get();

  if (!result) return null;

  const filters = (result.filters ?? {}) as Record<string, unknown>;
  const errorMessage =
    typeof filters.errorMessage === "string" ? filters.errorMessage : undefined;

  return {
    status: result.status,
    resultsCount: result.resultsCount ?? 0,
    errorMessage,
  };
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
    searchTerms: (result.searchTerms as string[]) ?? [],
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
  postedDate: string | null;
  relevanceScore: number | null;
  isFavorite: number | null;
  isViewed: number | null;
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

interface VacancyShape {
  title?: string;
  company?: string;
  location?: string;
  url?: string;
  platform?: string;
  description?: string;
  postedDate?: string;
  relevanceScore?: number;
}

export async function executeSearch(
  searchId: string,
  maxResultsOverride?: number,
): Promise<{ success: boolean; resultsCount: number; error?: string }> {
  const db = getDb();

  const search = db
    .select()
    .from(searches)
    .where(eq(searches.id, searchId))
    .get();

  if (!search) {
    return { success: false, resultsCount: 0, error: "Search not found" };
  }

  const profile = db
    .select()
    .from(profiles)
    .where(eq(profiles.id, search.profileId))
    .get();

  if (!profile) {
    const message = "Profile not found";
    markFailed(db, searchId, message);
    return { success: false, resultsCount: 0, error: message };
  }

  db.update(searches)
    .set({ status: "running", startedAt: new Date() })
    .where(eq(searches.id, searchId))
    .run();

  const profileSkills = (profile.skills ?? []) as string[];
  const profileExperience = (profile.experience ?? []) as Experience[];

  const searchFilters = (search.filters ?? {}) as Record<string, unknown>;
  const requestedMax =
    maxResultsOverride ??
    (typeof searchFilters.maxResults === "number"
      ? searchFilters.maxResults
      : null) ??
    20;

  const agentInput = {
    profile: {
      name: profile.name,
      title: profile.title ?? null,
      location: profile.location ?? null,
      skills: profileSkills,
      experience: profileExperience.map((e) => ({
        title: e.title,
        company: e.company,
        startDate: e.startDate,
        endDate: e.endDate,
        description: e.description,
      })),
      preferences: {
        remote: true,
        location: profile.location ?? null,
      },
    },
    searchTerms: (search.searchTerms as string[]) ?? [],
    maxResults: requestedMax,
  };

  const result = await runAgent("ofj-search", agentInput);

  if (!result.success) {
    const message = result.error ?? "Agent run failed";
    markFailed(db, searchId, message);
    return { success: false, resultsCount: 0, error: message };
  }

  const vacancies = Array.isArray(result.data)
    ? (result.data as VacancyShape[])
    : [];

  let inserted = 0;
  for (const vacancy of vacancies) {
    if (!vacancy.title || !vacancy.company || !vacancy.platform) continue;

    const id = nanoid();
    try {
      db.insert(jobListings)
        .values({
          id,
          searchId,
          platform: vacancy.platform,
          title: vacancy.title,
          company: vacancy.company,
          description: vacancy.description ?? null,
          url: vacancy.url ?? null,
          location: vacancy.location ?? null,
          postedDate: vacancy.postedDate ?? null,
          relevanceScore: vacancy.relevanceScore ?? null,
          createdAt: new Date(),
        })
        .onConflictDoNothing({ target: jobListings.url })
        .run();
      inserted += 1;
    } catch {
      // Conflict on url means a duplicate — skip it.
    }
  }

  db.update(searches)
    .set({
      status: "completed",
      resultsCount: inserted,
      completedAt: new Date(),
    })
    .where(eq(searches.id, searchId))
    .run();

  return { success: true, resultsCount: inserted };
}

function markFailed(
  db: ReturnType<typeof getDb>,
  searchId: string,
  message: string,
): void {
  db.update(searches)
    .set({
      status: "failed",
      completedAt: new Date(),
      filters: { errorMessage: message },
    })
    .where(eq(searches.id, searchId))
    .run();
}

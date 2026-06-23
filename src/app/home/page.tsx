import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { searches, jobListings } from "@/server/db/schema";
import { getFirstProfile } from "@/server/profile/service";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import type {
  ViewedJob,
  SearchHistoryItem,
  FavoriteJob,
} from "@/components/dashboard/HistoryTabs";

export const dynamic = "force-dynamic";

async function getRecentSearches(profileId: string): Promise<SearchHistoryItem[]> {
  const db = getDb();
  const rows = db
    .select({
      id: searches.id,
      searchTerms: searches.searchTerms,
      resultsCount: searches.resultsCount,
      createdAt: searches.createdAt,
    })
    .from(searches)
    .where(eq(searches.profileId, profileId))
    .orderBy(desc(searches.createdAt))
    .limit(5)
    .all();

  return rows.map((row) => ({
    id: row.id,
    terms: (row.searchTerms as string[]) ?? [],
    resultsCount: row.resultsCount ?? 0,
    createdAt: row.createdAt?.toISOString() ?? "",
  }));
}

async function getViewedJobs(profileId: string): Promise<ViewedJob[]> {
  const db = getDb();
  const rows = db
    .select({
      id: jobListings.id,
      title: jobListings.title,
      company: jobListings.company,
      url: jobListings.url,
    })
    .from(jobListings)
    .innerJoin(searches, eq(jobListings.searchId, searches.id))
    .where(
      and(eq(searches.profileId, profileId), eq(jobListings.isViewed, 1)),
    )
    .orderBy(desc(jobListings.createdAt))
    .limit(10)
    .all();

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    company: row.company,
    url: row.url,
  }));
}

async function getFavoriteJobs(profileId: string): Promise<FavoriteJob[]> {
  const db = getDb();
  const rows = db
    .select({
      id: jobListings.id,
      title: jobListings.title,
      company: jobListings.company,
      url: jobListings.url,
    })
    .from(jobListings)
    .innerJoin(searches, eq(jobListings.searchId, searches.id))
    .where(
      and(eq(searches.profileId, profileId), eq(jobListings.isFavorite, 1)),
    )
    .orderBy(desc(jobListings.createdAt))
    .limit(10)
    .all();

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    company: row.company,
    url: row.url,
  }));
}

export default async function HomePage() {
  const profile = await getFirstProfile();

  if (!profile) {
    redirect("/");
  }

  const [searches, viewedJobs, favoriteJobs] = await Promise.all([
    getRecentSearches(profile.id),
    getViewedJobs(profile.id),
    getFavoriteJobs(profile.id),
  ]);

  return (
    <DashboardContent
      profile={profile}
      viewedJobs={viewedJobs}
      searches={searches}
      favoriteJobs={favoriteJobs}
    />
  );
}

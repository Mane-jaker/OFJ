process.env.OFJ_DRY_RUN = "true";

import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { getDb, createTables } from "@/server/db";
import {
  profiles,
  searches,
  jobListings,
  generatedCvs,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

describe("Integration: Favorite and viewed flags", () => {
  let profileId: string;
  let searchId: string;
  let jobListingId: string;

  beforeAll(() => {
    createTables();
  });

  beforeEach(() => {
    const db = getDb();
    db.delete(generatedCvs).run();
    db.delete(jobListings).run();
    db.delete(searches).run();
    db.delete(profiles).run();

    profileId = nanoid();
    db.insert(profiles)
      .values({
        id: profileId,
        name: "Flags User",
        email: `flags-${profileId}@example.com`,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .run();

    searchId = nanoid();
    db.insert(searches)
      .values({
        id: searchId,
        profileId,
        platforms: ["linkedin"],
        searchTerms: ["react"],
        createdAt: new Date(),
      })
      .run();

    jobListingId = nanoid();
    db.insert(jobListings)
      .values({
        id: jobListingId,
        searchId,
        platform: "linkedin",
        title: "Fav Job",
        company: "Fav Co",
        url: "https://linkedin.com/jobs/view/fav-1",
        createdAt: new Date(),
      })
      .run();
  });

  it("sets and queries isFavorite", () => {
    const db = getDb();

    db.update(jobListings)
      .set({ isFavorite: 1 })
      .where(eq(jobListings.id, jobListingId))
      .run();

    const row = db
      .select()
      .from(jobListings)
      .where(eq(jobListings.id, jobListingId))
      .get();

    expect(row?.isFavorite).toBe(1);

    const favorites = db
      .select()
      .from(jobListings)
      .where(eq(jobListings.isFavorite, 1))
      .all();

    expect(favorites.length).toBe(1);
    expect(favorites[0].id).toBe(jobListingId);
  });

  it("sets and queries isViewed", () => {
    const db = getDb();

    db.update(jobListings)
      .set({ isViewed: 1 })
      .where(eq(jobListings.id, jobListingId))
      .run();

    const row = db
      .select()
      .from(jobListings)
      .where(eq(jobListings.id, jobListingId))
      .get();

    expect(row?.isViewed).toBe(1);

    const viewed = db
      .select()
      .from(jobListings)
      .where(eq(jobListings.isViewed, 1))
      .all();

    expect(viewed.length).toBe(1);
    expect(viewed[0].id).toBe(jobListingId);
  });

  it("defaults both flags to 0", () => {
    const db = getDb();
    const row = db
      .select()
      .from(jobListings)
      .where(eq(jobListings.id, jobListingId))
      .get();

    expect(row?.isFavorite).toBe(0);
    expect(row?.isViewed).toBe(0);
  });
});

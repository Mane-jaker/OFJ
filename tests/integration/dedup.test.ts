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
import { createProfile } from "@/server/profile/service";
import { createSearch } from "@/server/agent/service";

const DUPLICATE_URL = "https://linkedin.com/jobs/view/unique-dup-1";

describe("Integration: URL deduplication", () => {
  let profileId: string;
  let searchId: string;

  beforeAll(() => {
    createTables();
  });

  beforeEach(async () => {
    const db = getDb();
    db.delete(generatedCvs).run();
    db.delete(jobListings).run();
    db.delete(searches).run();
    db.delete(profiles).run();

    const { id: pid } = await createProfile({
      name: "Dedup User",
      email: "dedup@example.com",
      cvText: "Some CV",
    });
    profileId = pid;

    const { id: sid } = await createSearch({
      profileId,
      platforms: ["linkedin"],
      searchTerms: ["react"],
    });
    searchId = sid;
  });

  it("does not insert duplicate URLs (onConflictDoNothing)", () => {
    const db = getDb();

    const firstId = nanoid();
    db.insert(jobListings)
      .values({
        id: firstId,
        searchId,
        platform: "linkedin",
        title: "First Job",
        company: "First Co",
        url: DUPLICATE_URL,
        createdAt: new Date(),
      })
      .run();

    const secondId = nanoid();
    db.insert(jobListings)
      .values({
        id: secondId,
        searchId,
        platform: "linkedin",
        title: "Second Job",
        company: "Second Co",
        url: DUPLICATE_URL,
        createdAt: new Date(),
      })
      .onConflictDoNothing({ target: jobListings.url })
      .run();

    const withUrl = db
      .select()
      .from(jobListings)
      .where(eq(jobListings.url, DUPLICATE_URL))
      .all();

    expect(withUrl.length).toBe(1);
    expect(withUrl[0].title).toBe("First Job");

    const total = db.select().from(jobListings).all();
    expect(total.length).toBe(1);
  });
});

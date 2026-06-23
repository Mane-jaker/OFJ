process.env.OFJ_DRY_RUN = "true";

import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { getDb, createTables } from "@/server/db";
import {
  profiles,
  searches,
  jobListings,
  generatedCvs,
} from "@/server/db/schema";
import { createProfile } from "@/server/profile/service";
import {
  createSearch,
  executeSearch,
  getSearchStatus,
  getJobListings,
} from "@/server/agent/service";

describe("Integration: Complete search flow (dry-run)", () => {
  let profileId: string;

  beforeAll(() => {
    createTables();
  });

  beforeEach(async () => {
    const db = getDb();
    db.delete(generatedCvs).run();
    db.delete(jobListings).run();
    db.delete(searches).run();
    db.delete(profiles).run();

    const { id } = await createProfile({
      name: "Searcher User",
      email: "searcher@example.com",
      title: "Frontend Developer",
      location: "Remote",
      cvText: "React and TypeScript developer",
      skills: ["React", "TypeScript"],
    });
    profileId = id;
  });

  it("creates a search, executes it (dry-run), and verifies results", async () => {
    const { id: searchId } = await createSearch({
      profileId,
      platforms: ["linkedin"],
      searchTerms: ["react"],
      model: "gpt-4",
    });

    expect(searchId).toBeDefined();

    const statusBefore = await getSearchStatus(searchId);
    expect(statusBefore?.status).toBe("pending");

    const result = await executeSearch(searchId);
    expect(result.success).toBe(true);
    expect(result.resultsCount).toBeGreaterThan(0);

    const statusAfter = await getSearchStatus(searchId);
    expect(statusAfter?.status).toBe("completed");
    expect(statusAfter?.resultsCount).toBeGreaterThan(0);

    const listings = await getJobListings(searchId);
    expect(listings.length).toBeGreaterThanOrEqual(1);
    expect(listings[0].searchId).toBe(searchId);
    expect(listings[0].title).toBeDefined();
    expect(listings[0].company).toBeDefined();
    expect(listings[0].platform).toBe("linkedin");
  });
});

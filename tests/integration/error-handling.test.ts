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
import { createProfile } from "@/server/profile/service";
import {
  createSearch,
  getSearchStatus,
  updateSearchStatus,
} from "@/server/agent/service";

describe("Integration: Search error handling", () => {
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
      name: "Error User",
      email: "error@example.com",
      cvText: "Some CV",
    });
    profileId = id;
  });

  it("marks a search as failed and exposes the error message", async () => {
    const { id: searchId } = await createSearch({
      profileId,
      platforms: ["linkedin"],
      searchTerms: ["react"],
      model: "gpt-4",
    });

    const db = getDb();
    db.update(searches)
      .set({
        status: "failed",
        completedAt: new Date(),
        filters: { errorMessage: "Agent timed out" },
      })
      .where(eq(searches.id, searchId))
      .run();

    const status = await getSearchStatus(searchId);
    expect(status).not.toBeNull();
    expect(status!.status).toBe("failed");
    expect(status!.errorMessage).toBe("Agent timed out");
  });

  it("getSearchStatus returns null for unknown search id", async () => {
    const status = await getSearchStatus("nonexistent-id");
    expect(status).toBeNull();
  });

  it("updateSearchStatus transitions to failed", async () => {
    const { id: searchId } = await createSearch({
      profileId,
      platforms: ["linkedin"],
      searchTerms: ["react"],
    });

    await updateSearchStatus(searchId, "failed");

    const status = await getSearchStatus(searchId);
    expect(status?.status).toBe("failed");
  });
});

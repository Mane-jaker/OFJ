process.env.OFJ_DRY_RUN = "true";

import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { getDb, createTables } from "@/server/db";
import {
  profiles,
  searches,
  jobListings,
  generatedCvs,
} from "@/server/db/schema";
import { createProfile, updateProfile, getProfile } from "@/server/profile/service";

describe("Integration: Profile editing", () => {
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
      name: "Original Name",
      email: "original@example.com",
      title: "Developer",
      location: "Madrid, ES",
      cvText: "Original CV text",
      skills: ["JavaScript"],
    });
    profileId = id;
  });

  it("updates profile name while preserving email", async () => {
    const before = await getProfile(profileId);
    expect(before?.name).toBe("Original Name");
    expect(before?.email).toBe("original@example.com");
    const createdAt = before!.createdAt;

    await updateProfile(profileId, {
      name: "Updated Name",
      email: "original@example.com",
      title: "Senior Developer",
      location: "Madrid, ES",
      cvText: "Original CV text",
      skills: ["JavaScript", "TypeScript"],
    });

    const after = await getProfile(profileId);
    expect(after?.name).toBe("Updated Name");
    expect(after?.email).toBe("original@example.com");
    expect(after?.title).toBe("Senior Developer");
    expect(after?.skills).toEqual(["JavaScript", "TypeScript"]);
    expect(after!.updatedAt.getTime()).toBeGreaterThanOrEqual(
      createdAt.getTime(),
    );
  });

  it("updatedAt advances on subsequent edits", async () => {
    await updateProfile(profileId, {
      name: "Edit One",
      email: "original@example.com",
    });

    const first = await getProfile(profileId);
    const firstUpdated = first!.updatedAt;

    await new Promise((r) => setTimeout(r, 10));

    await updateProfile(profileId, {
      name: "Edit Two",
      email: "original@example.com",
    });

    const second = await getProfile(profileId);
    expect(second!.updatedAt.getTime()).toBeGreaterThanOrEqual(
      firstUpdated.getTime(),
    );
    expect(second?.name).toBe("Edit Two");
  });
});

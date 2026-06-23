process.env.OFJ_DRY_RUN = "true";

import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { getDb, createTables } from "@/server/db";
import {
  profiles,
  searches,
  jobListings,
  generatedCvs,
} from "@/server/db/schema";
import {
  createProfile,
  getProfile,
  hasAnyProfile,
} from "@/server/profile/service";

describe("Integration: First-time user flow", () => {
  beforeAll(() => {
    createTables();
  });

  beforeEach(() => {
    const db = getDb();
    db.delete(generatedCvs).run();
    db.delete(jobListings).run();
    db.delete(searches).run();
    db.delete(profiles).run();
  });

  it("creates a profile from CV text and retrieves it", async () => {
    const { id } = await createProfile({
      name: "Jane Doe",
      email: "jane@example.com",
      title: "Frontend Developer",
      location: "Buenos Aires, AR",
      cvText: "React developer with 5 years of experience...",
      skills: ["React", "TypeScript", "Next.js"],
    });

    expect(id).toBeDefined();

    const db = getDb();
    const row = db
      .select()
      .from(profiles)
      .all()
      .find((p) => p.id === id);

    expect(row).toBeDefined();
    expect(row?.name).toBe("Jane Doe");
    expect(row?.email).toBe("jane@example.com");
    expect(row?.cvText).toContain("React developer");
    expect(row?.title).toBe("Frontend Developer");
  });

  it("checkProfileExists returns true after profile creation", async () => {
    expect(await hasAnyProfile()).toBe(false);

    await createProfile({
      name: "First User",
      email: "first@example.com",
      cvText: "Some CV text",
    });

    expect(await hasAnyProfile()).toBe(true);
  });

  it("getProfile returns the profile with all data", async () => {
    const { id } = await createProfile({
      name: "Full Profile",
      email: "full@example.com",
      title: "Senior Engineer",
      location: "Remote",
      cvText: "Full CV content here",
      skills: ["Go", "Rust"],
    });

    const profile = await getProfile(id);

    expect(profile).not.toBeNull();
    expect(profile!.id).toBe(id);
    expect(profile!.name).toBe("Full Profile");
    expect(profile!.email).toBe("full@example.com");
    expect(profile!.title).toBe("Senior Engineer");
    expect(profile!.location).toBe("Remote");
    expect(profile!.cvText).toBe("Full CV content here");
    expect(profile!.skills).toEqual(["Go", "Rust"]);
    expect(profile!.createdAt).toBeInstanceOf(Date);
    expect(profile!.updatedAt).toBeInstanceOf(Date);
  });
});

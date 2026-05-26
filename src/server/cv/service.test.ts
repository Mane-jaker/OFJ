import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { getDb, createTables } from "@/server/db";
import { profiles, generatedCvs } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { generateCVContent, saveCV } from "./service";
import { nanoid } from "nanoid";

describe("CV Service", () => {
  beforeAll(() => {
    createTables();
  });

  let profileId: string;

  beforeEach(() => {
    const db = getDb();
    db.delete(generatedCvs).run();
    db.delete(profiles).run();

    // Create a test profile
    profileId = nanoid();
    db.insert(profiles).values({
      id: profileId,
      name: "CV Test User",
      email: "cvtest@example.com",
      title: "Developer",
      skills: ["TypeScript", "React"],
      experience: [],
      education: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }).run();
  });

  it("generateCVContent formats profile sections", async () => {
    const profile = {
      id: profileId,
      name: "CV Test User",
      email: "cvtest@example.com",
      title: "Developer",
      location: "Remote",
      skills: ["TypeScript", "React"],
      experience: [
        {
          company: "Test Co",
          title: "Engineer",
          startDate: "2020-01",
          description: "Built stuff",
        },
      ],
      education: [
        {
          institution: "Test U",
          degree: "BS",
          field: "CS",
          startYear: 2016,
          endYear: 2020,
        },
      ],
      cvFilePath: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const content = await generateCVContent(profile);

    expect(content).toContain("CV TEST USER");
    expect(content).toContain("Developer");
    expect(content).toContain("TypeScript, React");
    expect(content).toContain("Test Co");
    expect(content).toContain("Test U");
    expect(content).toContain("cvtest@example.com");
  });

  it("saveCV persists record with correct FK", async () => {
    const result = await saveCV({
      profileId,
      content: "Test CV content",
    });

    expect(result.id).toBeDefined();

    const db = getDb();
    const allCvs = db
      .select()
      .from(generatedCvs)
      .where(eq(generatedCvs.profileId, profileId))
      .all();

    expect(allCvs).toHaveLength(1);
    expect(allCvs[0].content).toBe("Test CV content");
  });

  it("generateCVContent includes job title when tailored", async () => {
    const profile = {
      id: profileId,
      name: "CV Test User",
      email: "cvtest@example.com",
      title: "Developer",
      location: null,
      skills: ["TypeScript", "React"],
      experience: [],
      education: [],
      cvFilePath: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const content = await generateCVContent(profile, {
      jobTitle: "Senior React Developer",
    });

    expect(content).toContain("Senior React Developer");
  });
});

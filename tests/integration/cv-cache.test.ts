process.env.OFJ_DRY_RUN = "true";

import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { getDb, createTables } from "@/server/db";
import {
  profiles,
  searches,
  jobListings,
  generatedCvs,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { nanoid } from "nanoid";
import { createProfile } from "@/server/profile/service";
import { createSearch, executeSearch, getJobListings } from "@/server/agent/service";
import { generateCv, getCvByJobListing } from "@/server/cv/service";

const cacheDir = path.join(os.homedir(), ".ofj", "cache");
const createdFiles: string[] = [];

describe("Integration: CV generation and cache", () => {
  let profileId: string;
  let jobListingId: string;

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
      name: "CV User",
      email: "cv@example.com",
      title: "Frontend Developer",
      cvText: "React developer",
      skills: ["React", "TypeScript"],
    });
    profileId = pid;

    const { id: searchId } = await createSearch({
      profileId,
      platforms: ["linkedin"],
      searchTerms: ["react"],
      model: "gpt-4",
    });

    await executeSearch(searchId);
    const listings = await getJobListings(searchId);
    expect(listings.length).toBeGreaterThan(0);
    jobListingId = listings[0].id;
  });

  afterAll(() => {
    for (const f of createdFiles) {
      try {
        if (fs.existsSync(f)) fs.unlinkSync(f);
      } catch {
        // ignore
      }
    }
  });

  it("generates a tailored CV and caches the PDF", async () => {
    const result = await generateCv(profileId, jobListingId);

    expect(result.id).toBeDefined();
    expect(result.profileId).toBe(profileId);
    expect(result.jobListingId).toBe(jobListingId);
    expect(result.tailoredSummary).toBeTruthy();
    expect(Array.isArray(result.tailoredSkills)).toBe(true);
    expect(result.tailoredSkills.length).toBeGreaterThan(0);
    expect(Array.isArray(result.tailoredExperience)).toBe(true);
    expect(result.tailoredExperience.length).toBeGreaterThan(0);
    expect(result.filePath).toBeTruthy();

    const db = getDb();
    const record = db
      .select()
      .from(generatedCvs)
      .where(eq(generatedCvs.jobListingId, jobListingId))
      .get();

    expect(record).toBeDefined();
    expect(record?.tailoredSummary).toBe(result.tailoredSummary);
    expect(record?.filePath).toBe(result.filePath);

    expect(fs.existsSync(result.filePath)).toBe(true);
    createdFiles.push(result.filePath);
  });

  it("returns cache hit on second generation for same job listing", async () => {
    const first = await generateCv(profileId, jobListingId);
    createdFiles.push(first.filePath);

    const cached = await getCvByJobListing(jobListingId);
    expect(cached.exists).toBe(true);
    expect(cached.filePath).toBe(first.filePath);
    expect(fs.existsSync(cached.filePath!)).toBe(true);

    const second = await generateCv(profileId, jobListingId);
    expect(second.id).toBe(first.id);

    const db = getDb();
    const rows = db
      .select()
      .from(generatedCvs)
      .where(eq(generatedCvs.jobListingId, jobListingId))
      .all();
    expect(rows.length).toBe(1);
  });
});

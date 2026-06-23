import { describe, it, expect, beforeAll } from "vitest";
import { getDb, createTables } from "@/server/db";
import { profiles, searches, jobListings, generatedCvs } from "@/server/db/schema";
import { nanoid } from "nanoid";

function createTestProfile(db: ReturnType<typeof getDb>): string {
  const id = nanoid();
  db.insert(profiles).values({
    id,
    name: "Schema Test",
    email: `schema-${id}@example.com`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).run();
  return id;
}

function createTestSearch(db: ReturnType<typeof getDb>, profileId: string): string {
  const id = nanoid();
  db.insert(searches).values({
    id,
    profileId,
    platforms: ["linkedin"],
    searchTerms: ["react"],
    createdAt: new Date(),
  }).run();
  return id;
}

describe("Database Schema", () => {
  beforeAll(() => {
    createTables();
  });

  describe("Profiles table", () => {
    it("stores a profile with minimal data", () => {
      const db = getDb();
      const id = nanoid();
      const now = new Date();

      db.insert(profiles).values({
        id,
        name: "Test User",
        email: "test@example.com",
        createdAt: now,
        updatedAt: now,
      }).run();

      const found = db
        .select()
        .from(profiles)
        .all()
        .find((p) => p.id === id);

      expect(found).toBeDefined();
      expect(found?.name).toBe("Test User");
      expect(found?.email).toBe("test@example.com");
    });

    it("sets default values for optional fields", () => {
      const db = getDb();
      const id = nanoid();
      const now = new Date();

      db.insert(profiles).values({
        id,
        name: "Default Test",
        email: "defaults@example.com",
        createdAt: now,
        updatedAt: now,
      }).run();

      const found = db
        .select()
        .from(profiles)
        .all()
        .find((p) => p.id === id);

      expect(found).toBeDefined();
      expect(Array.isArray(found!.skills)).toBe(true);
      expect(Array.isArray(found!.experience)).toBe(true);
      expect(Array.isArray(found!.education)).toBe(true);
    });
  });

  describe("Searches table", () => {
    it("creates search with pending status", () => {
      const db = getDb();
      const id = nanoid();

      const profileId = createTestProfile(db);
      db.insert(searches).values({
        id,
        profileId,
        platforms: ["linkedin"],
        searchTerms: ["react", "remote"],
        createdAt: new Date(),
      }).run();

      const found = db
        .select()
        .from(searches)
        .all()
        .find((s) => s.id === id);

      expect(found).toBeDefined();
      expect(found?.status).toBe("pending");
    });
  });

  describe("Job listings table", () => {
    it("defaults isFavorite and isViewed to 0", () => {
      const db = getDb();
      const id = nanoid();

      const profileId = createTestProfile(db);
      const searchId = createTestSearch(db, profileId);
      db.insert(jobListings).values({
        id,
        searchId,
        platform: "linkedin",
        title: "Test Job",
        company: "Test Co",
        createdAt: new Date(),
      }).run();

      const found = db
        .select()
        .from(jobListings)
        .all()
        .find((j) => j.id === id);

      expect(found).toBeDefined();
      expect(found?.isFavorite).toBe(0);
      expect(found?.isViewed).toBe(0);
    });
  });

  describe("Generated CVs table", () => {
    it("stores CV with profile FK", () => {
      const db = getDb();
      const id = nanoid();

      const profileId = createTestProfile(db);
      db.insert(generatedCvs).values({
        id,
        profileId,
        content: "Test CV content",
        createdAt: new Date(),
      }).run();

      const found = db
        .select()
        .from(generatedCvs)
        .all()
        .find((c) => c.id === id);

      expect(found).toBeDefined();
      expect(found?.profileId).toBe(profileId);
    });
  });

  describe("Schema module structure", () => {
    it("exports all four table schemas", () => {
      expect(profiles).toBeDefined();
      expect(searches).toBeDefined();
      expect(jobListings).toBeDefined();
      expect(generatedCvs).toBeDefined();
    });
  });
});

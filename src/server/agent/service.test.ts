import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { getDb, createTables } from "@/server/db";
import { profiles, searches } from "@/server/db/schema";
import {
  createSearch,
  getSearchStatus,
  updateSearchStatus,
  getSearchById,
} from "./service";
import { nanoid } from "nanoid";

describe("Agent Service", () => {
  beforeAll(() => {
    createTables();
  });

  let testProfileId: string;

  beforeEach(() => {
    const db = getDb();
    db.delete(searches).run();
    db.delete(profiles).run();

    testProfileId = nanoid();
    db.insert(profiles).values({
      id: testProfileId,
      name: "Test Agent User",
      email: `agent-${testProfileId}@example.com`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).run();
  });

  it("createSearch sets status=pending", async () => {
    const result = await createSearch({
      profileId: testProfileId,
      platforms: ["linkedin"],
      apiKey: "sk-test",
      model: "gpt-4",
    });

    expect(result.id).toBeDefined();

    const status = await getSearchStatus(result.id);
    expect(status?.status).toBe("pending");
  });

  it("status transitions: pending -> running -> completed", async () => {
    const { id } = await createSearch({
      profileId: testProfileId,
      platforms: ["linkedin"],
      apiKey: "sk-test",
      model: "gpt-4",
    });

    // Transition to running
    await updateSearchStatus(id, "running");
    let status = await getSearchStatus(id);
    expect(status?.status).toBe("running");

    // Transition to completed
    await updateSearchStatus(id, "completed");
    status = await getSearchStatus(id);
    expect(status?.status).toBe("completed");
  });

  it("getSearchStatus returns correct state", async () => {
    const { id } = await createSearch({
      profileId: testProfileId,
      platforms: ["indeed"],
      apiKey: "sk-test-2",
      model: "claude-3.5-sonnet",
    });

    const status = await getSearchStatus(id);
    expect(status).not.toBeNull();
    expect(status!.resultsCount).toBe(0);
  });

  it("getSearchById returns full search object", async () => {
    const { id } = await createSearch({
      profileId: testProfileId,
      platforms: ["linkedin", "indeed"],
      apiKey: "sk-full",
      model: "gpt-4o",
    });

    const search = await getSearchById(id);
    expect(search).not.toBeNull();
    expect(search!.platforms).toEqual(["linkedin", "indeed"]);
    expect(search!.model).toBe("gpt-4o");
  });
});

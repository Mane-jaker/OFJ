import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { getDb, createTables } from "@/server/db";
import { profiles } from "@/server/db/schema";
import {
  createProfile,
  updateProfile,
  getProfile,
} from "./service";

describe("Profile Service", () => {
  beforeAll(() => {
    createTables();
  });

  beforeEach(() => {
    const db = getDb();
    db.delete(profiles).run();
  });

  it("createProfile stores a record", async () => {
    const result = await createProfile({
      name: "Jane Doe",
      email: "jane@example.com",
      title: "Engineer",
    });

    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe("string");

    const profile = await getProfile(result.id);
    expect(profile).not.toBeNull();
    expect(profile?.name).toBe("Jane Doe");
    expect(profile?.email).toBe("jane@example.com");
    expect(profile?.title).toBe("Engineer");
  });

  it("updateProfile sets updatedAt", async () => {
    const created = await createProfile({
      name: "Old Name",
      email: "old@example.com",
    });

    await new Promise((r) => setTimeout(r, 100)); // Ensure timestamp changes

    await updateProfile(created.id, {
      name: "New Name",
      email: "old@example.com",
    });

    const profile = await getProfile(created.id);
    expect(profile?.name).toBe("New Name");
    expect(profile?.updatedAt.getTime()).toBeGreaterThan(
      profile!.createdAt.getTime(),
    );
  });

  it("getProfile returns null for missing id", async () => {
    const result = await getProfile("nonexistent");
    expect(result).toBeNull();
  });

  it("createProfile sets default empty arrays for optional fields", async () => {
    const result = await createProfile({
      name: "Default Test",
      email: "defaults@example.com",
    });

    const profile = await getProfile(result.id);
    expect(profile?.skills).toEqual([]);
    expect(profile?.experience).toEqual([]);
    expect(profile?.education).toEqual([]);
    expect(profile?.roles).toEqual([]);
    expect(profile?.salaryExpectation).toBeNull();
  });

  it("createProfile stores roles and salaryExpectation", async () => {
    const result = await createProfile({
      name: "Jane Doe",
      email: "jane.roles@example.com",
      roles: ["Senior Java Developer", "DevOps Engineer", "Backend Engineer"],
      salaryExpectation: "USD 120k-150k",
    });

    const profile = await getProfile(result.id);
    expect(profile?.roles).toEqual([
      "Senior Java Developer",
      "DevOps Engineer",
      "Backend Engineer",
    ]);
    expect(profile?.salaryExpectation).toBe("USD 120k-150k");
  });

  it("updateProfile stores roles explicitly", async () => {
    const { id } = await createProfile({
      name: "Role Test",
      email: "roles.update@example.com",
    });

    await updateProfile(id, {
      name: "Role Test Updated",
      email: "roles.update@example.com",
      roles: ["Senior Engineer"],
      salaryExpectation: "USD 150k",
    });

    const profile = await getProfile(id);
    expect(profile?.roles).toEqual(["Senior Engineer"]);
    expect(profile?.salaryExpectation).toBe("USD 150k");
  });
});

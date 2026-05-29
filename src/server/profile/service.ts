import { eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { profiles, type Experience, type Education } from "@/server/db/schema";
import { nanoid } from "nanoid";

export interface ProfileFormData {
  name: string;
  email: string;
  title?: string | null;
  location?: string | null;
  cvText?: string | null;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
}

export interface Profile extends ProfileFormData {
  id: string;
  cvFilePath?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function createProfile(
  data: ProfileFormData,
): Promise<{ id: string }> {
  const db = getDb();
  const id = nanoid();
  const now = new Date();

  db.insert(profiles)
    .values({
      id,
      name: data.name,
      email: data.email,
      title: data.title ?? null,
      location: data.location ?? null,
      cvText: data.cvText ?? null,
      skills: data.skills ?? [],
      experience: data.experience ?? [],
      education: data.education ?? [],
      createdAt: now,
      updatedAt: now,
    })
    .run();

  return { id };
}

export async function updateProfile(
  id: string,
  data: ProfileFormData,
): Promise<void> {
  const db = getDb();
  const now = new Date();

  db.update(profiles)
    .set({
      name: data.name,
      email: data.email,
      title: data.title ?? null,
      location: data.location ?? null,
      cvText: data.cvText ?? null,
      skills: data.skills ?? [],
      experience: data.experience ?? [],
      education: data.education ?? [],
      updatedAt: now,
    })
    .where(eq(profiles.id, id))
    .run();
}

export async function getProfile(
  id: string,
): Promise<Profile | null> {
  const db = getDb();
  const result = db
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .get();

  if (!result) return null;

  return {
    ...result,
    skills: result.skills as string[],
    experience: result.experience as Experience[],
    education: result.education as Education[],
  };
}

export async function getProfileByEmail(
  email: string,
): Promise<Profile | null> {
  const db = getDb();
  const result = db
    .select()
    .from(profiles)
    .where(eq(profiles.email, email))
    .get();

  if (!result) return null;

  return {
    ...result,
    skills: result.skills as string[],
    experience: result.experience as Experience[],
    education: result.education as Education[],
  };
}

export async function hasAnyProfile(): Promise<boolean> {
  const db = getDb();
  const result = db
    .select({ id: profiles.id })
    .from(profiles)
    .limit(1)
    .get();
  return result !== undefined;
}

export async function getFirstProfile(): Promise<Profile | null> {
  const db = getDb();
  const result = db
    .select()
    .from(profiles)
    .limit(1)
    .get();

  if (!result) return null;

  return {
    ...result,
    skills: result.skills as string[],
    experience: result.experience as Experience[],
    education: result.education as Education[],
  };
}

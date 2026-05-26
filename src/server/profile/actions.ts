"use server";

import {
  createProfile as createProfileService,
  updateProfile as updateProfileService,
  getProfile as getProfileService,
} from "./service";
import type { ProfileFormData } from "./service";

export async function createProfile(data: ProfileFormData): Promise<{
  id: string;
  error?: string;
}> {
  try {
    const result = await createProfileService(data);
    return result;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create profile";
    return { id: "", error: message };
  }
}

export async function updateProfile(
  id: string,
  data: ProfileFormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateProfileService(id, data);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update profile";
    return { success: false, error: message };
  }
}

export async function getProfile(id: string) {
  try {
    const profile = await getProfileService(id);
    return profile;
  } catch {
    return null;
  }
}

export async function parseCV(
  formData: FormData,
): Promise<{ text: string; fileName: string } | { error: string }> {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { error: "No file provided" };
    }

    const text = await file.text();
    return { text, fileName: file.name };
  } catch {
    return { error: "Failed to parse file" };
  }
}

"use server";

import {
  createProfile as createProfileService,
  updateProfile as updateProfileService,
  getProfile as getProfileService,
  hasAnyProfile,
} from "./service";
import type { ProfileFormData } from "./service";
import { parseCVText } from "./parser";
import { redirect } from "next/navigation";

const ACCEPTED_TYPES = ["application/pdf", "text/plain"];
const ACCEPTED_EXTENSIONS = [".pdf", ".txt"];

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

export async function uploadCv(
  formData: FormData,
): Promise<{ error: string } | undefined> {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { error: "No se proporcionó ningún archivo" };
    }

    const isAcceptedType = ACCEPTED_TYPES.includes(file.type);
    const hasAcceptedExt = ACCEPTED_EXTENSIONS.some((ext) =>
      file.name.toLowerCase().endsWith(ext),
    );
    if (!isAcceptedType && !hasAcceptedExt) {
      return { error: "Solo se aceptan archivos PDF y TXT" };
    }

    let rawText: string;

    if (file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf") {
      try {
        const pdfParse = (await import("pdf-parse")).default;
        const buffer = Buffer.from(await file.arrayBuffer());
        const pdfData = await pdfParse(buffer);
        rawText = pdfData.text;
      } catch {
        return {
          error:
            "No se pudo leer el CV. Intentá con otro archivo o completá manualmente",
        };
      }
    } else {
      rawText = await file.text();
    }

    const parsed = parseCVText(rawText);
    const email = parsed.email ?? `cv-${Date.now()}@placeholder.com`;

    const profileData: ProfileFormData = {
      name: parsed.name ?? "Sin nombre",
      email,
      skills: parsed.skills,
      experience: parsed.experience,
      education: parsed.education,
      cvText: rawText,
    };

    await createProfileService(profileData);
  } catch {
    return {
      error: "No se pudo leer el CV. Intentá con otro archivo o completá manualmente",
    };
  }

  redirect("/home");
}

export async function checkProfileExists(): Promise<boolean> {
  try {
    return await hasAnyProfile();
  } catch {
    return false;
  }
}

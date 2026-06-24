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

function validateRoles(roles?: string[]): string[] {
  if (!roles || !Array.isArray(roles)) return [];
  return roles
    .map((r) => r.trim())
    .filter((r) => r.length > 0)
    .slice(0, 3);
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

    if (
      file.name.toLowerCase().endsWith(".pdf") ||
      file.type === "application/pdf"
    ) {
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

    const parsed = await parseCVText(rawText);
    const email = parsed.email ?? `cv-${Date.now()}@placeholder.com`;

    const profileData: ProfileFormData = {
      name: parsed.name ?? "Sin nombre",
      email,
      title: parsed.title,
      location: parsed.location,
      skills: parsed.skills,
      experience: parsed.experience,
      education: parsed.education,
      cvText: rawText,
    };

    await createProfileService(profileData);
  } catch {
    return {
      error:
        "No se pudo leer el CV. Intentá con otro archivo o completá manualmente",
    };
  }

  redirect("/home");
}

export async function updateCvFromFile(
  profileId: string,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No se proporcionó ningún archivo" };
    }

    const isAcceptedType = ACCEPTED_TYPES.includes(file.type);
    const hasAcceptedExt = ACCEPTED_EXTENSIONS.some((ext) =>
      file.name.toLowerCase().endsWith(ext),
    );
    if (!isAcceptedType && !hasAcceptedExt) {
      return { success: false, error: "Solo se aceptan archivos PDF y TXT" };
    }

    let rawText: string;
    if (
      file.name.toLowerCase().endsWith(".pdf") ||
      file.type === "application/pdf"
    ) {
      const pdfParse = (await import("pdf-parse")).default;
      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfData = await pdfParse(buffer);
      rawText = pdfData.text;
    } else {
      rawText = await file.text();
    }

    const existing = await getProfileService(profileId);
    if (!existing) {
      return { success: false, error: "Perfil no encontrado" };
    }

    const parsed = await parseCVText(rawText);

    await updateProfileService(profileId, {
      name: parsed.name ?? existing.name,
      email: parsed.email ?? existing.email,
      title: parsed.title ?? existing.title,
      location: parsed.location ?? existing.location,
      skills: parsed.skills,
      experience: parsed.experience,
      education: parsed.education,
      cvText: rawText,
      // Preserve existing roles and salaryExpectation
      roles: existing.roles,
      salaryExpectation: existing.salaryExpectation,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el CV",
    };
  }
}

export async function createProfile(data: ProfileFormData): Promise<{
  id: string;
  error?: string;
}> {
  try {
    data.roles = validateRoles(data.roles);
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
    data.roles = validateRoles(data.roles);
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

export async function checkProfileExists(): Promise<boolean> {
  try {
    return await hasAnyProfile();
  } catch {
    return false;
  }
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { ProfileForm, type ProfileFormState } from "@/components/profile/ProfileForm";
import { ExperienceSection } from "@/components/profile/ExperienceSection";
import { SkillsSection } from "@/components/profile/SkillsSection";
import { EducationSection } from "@/components/profile/EducationSection";
import { createProfile } from "@/server/profile/actions";
import type { Experience, Education } from "@/server/db/schema";

export default function ProfilePage() {
  const router = useRouter();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  async function handleSave(data: ProfileFormState) {
    const result = await createProfile({
      name: data.name,
      email: data.email,
      title: data.title || null,
      location: data.location || null,
      skills,
      experience: experiences,
      education: educations,
    });

    if (result.id) {
      setProfileId(result.id);
      setShowSuccess(true);

      setTimeout(() => {
        router.push("/search");
      }, 1500);
    }
  }

  return (
    <Container variant="form" className="py-10">
      <ProgressBar currentStep={1} />

      <h1 className="mb-8 text-2xl font-bold">Profile Setup</h1>

      <div className="space-y-10">
        <ProfileForm onSave={handleSave} />

        <ExperienceSection
          experiences={experiences}
          onChange={setExperiences}
        />

        <SkillsSection skills={skills} onChange={setSkills} />

        <EducationSection educations={educations} onChange={setEducations} />
      </div>

      {showSuccess && (
        <div className="mt-6 rounded-[10px] bg-green-500/10 p-4 text-center text-sm text-green-400">
          Profile saved! Redirecting to search configuration...
        </div>
      )}
    </Container>
  );
}

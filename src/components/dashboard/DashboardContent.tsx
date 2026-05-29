"use client";

import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ExperienceSection } from "@/components/profile/ExperienceSection";
import { SkillsSection } from "@/components/profile/SkillsSection";
import { EducationSection } from "@/components/profile/EducationSection";
import { PlatformSelector } from "@/components/search/PlatformSelector";
import { AgentConfig } from "@/components/search/AgentConfig";

interface ProfileData {
  name: string;
  email: string;
  title?: string | null;
  location?: string | null;
  skills?: string[];
  experience?: { company: string; title: string; startDate: string; endDate?: string; description?: string }[];
  education?: { institution: string; degree: string; field: string; startYear: number; endYear?: number }[];
}

interface DashboardContentProps {
  profile: ProfileData;
}

export function DashboardContent({ profile }: DashboardContentProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["linkedin"]);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");

  return (
    <Container variant="landing" className="py-10">
      {/* Título */}
      <h1 className="text-2xl font-bold text-[var(--color-fg)]">
        Hola, {profile.name || "👋"}
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Columna principal — Perfil */}
        <div className="space-y-8">
          {/* Datos personales */}
          <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <h2 className="mb-6 text-lg font-semibold text-[var(--color-fg)]">
              Tu perfil
            </h2>
            <ProfileForm
              initialData={{
                name: profile.name,
                email: profile.email,
                title: profile.title ?? undefined,
                location: profile.location ?? undefined,
              }}
              readOnly
            />
          </section>

          {/* Habilidades */}
          <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <SkillsSection skills={profile.skills ?? []} readOnly />
          </section>

          {/* Experiencia */}
          {profile.experience && profile.experience.length > 0 && (
            <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <ExperienceSection experiences={profile.experience} readOnly />
            </section>
          )}

          {/* Educación */}
          {profile.education && profile.education.length > 0 && (
            <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <EducationSection educations={profile.education} readOnly />
            </section>
          )}
        </div>

        {/* Columna lateral — Búsqueda */}
        <aside className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <PlatformSelector
                platforms={selectedPlatforms}
                onChange={setSelectedPlatforms}
              />
            </section>

            <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <AgentConfig
                apiKey={apiKey}
                model={model}
                onApiKeyChange={setApiKey}
                onModelChange={setModel}
              />
            </section>
          </div>
        </aside>
      </div>
    </Container>
  );
}

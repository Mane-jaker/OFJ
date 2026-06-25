"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { useAgent } from "@/components/layout/AgentContext";
import { useAgentGate } from "@/components/layout/AgentGateContext";
import { ProfileForm, type ProfileFormState } from "@/components/profile/ProfileForm";
import { ExperienceSection } from "@/components/profile/ExperienceSection";
import { SkillsSection } from "@/components/profile/SkillsSection";
import { EducationSection } from "@/components/profile/EducationSection";
import { AgentConfig } from "@/components/search/AgentConfig";
import { SearchChips } from "@/components/dashboard/SearchChips";
import {
  HistoryTabs,
  type ViewedJob,
  type SearchHistoryItem,
  type FavoriteJob,
} from "@/components/dashboard/HistoryTabs";
import { DashboardTabs, type Tab } from "@/components/dashboard/DashboardTabs";
import { updateProfile } from "@/server/profile/actions";
import { updateCvFromFile } from "@/server/profile/actions";
import { startSearch } from "@/server/agent/actions";
import { SearchProgress } from "@/components/search/SearchProgress";
import type { Experience, Education } from "@/server/db/schema";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  title?: string | null;
  location?: string | null;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
  roles?: string[];
  salaryExpectation?: string | null;
}

interface DashboardContentProps {
  profile: ProfileData;
  viewedJobs: ViewedJob[];
  searches: SearchHistoryItem[];
  favoriteJobs: FavoriteJob[];
}

const RESULT_OPTIONS = [10, 20, 50];
type TabId = "search" | "profile" | "history";

export function DashboardContent({
  profile,
  viewedJobs,
  searches,
  favoriteJobs,
}: DashboardContentProps) {
  const router = useRouter();
  const { model: globalModel, selectModel } = useAgent();
  const { requireAgent } = useAgentGate();
  const [activeTab, setActiveTab] = useState<TabId>("search");
  const [model, setModel] = useState("");
  const [resultsCount, setResultsCount] = useState<number>(20);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const cvFileInputRef = useRef<HTMLInputElement>(null);
  const profileFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (globalModel) {
      setModel(`${globalModel.providerID}/${globalModel.modelID}`);
    }
  }, [globalModel]);

  function handleModelChange(value: string) {
    setModel(value);
    if (value) {
      const [pid, mid] = value.split("/");
      selectModel(pid, mid);
    }
  }

  // Editable profile state (kept separate from read-only prop)
  const [draftRoles, setDraftRoles] = useState<string[]>(profile.roles ?? []);
  const [draftSalary, setDraftSalary] = useState(profile.salaryExpectation ?? "");
  const [draftSkills, setDraftSkills] = useState<string[]>(profile.skills ?? []);
  const [draftExperience, setDraftExperience] = useState<Experience[]>(
    profile.experience ?? [],
  );
  const [draftEducation, setDraftEducation] = useState<Education[]>(
    profile.education ?? [],
  );

  const hasUnsavedChanges =
    isEditing && (
      JSON.stringify(draftRoles) !== JSON.stringify(profile.roles ?? []) ||
      draftSalary !== (profile.salaryExpectation ?? "") ||
      JSON.stringify(draftSkills) !== JSON.stringify(profile.skills ?? []) ||
      JSON.stringify(draftExperience) !== JSON.stringify(profile.experience ?? []) ||
      JSON.stringify(draftEducation) !== JSON.stringify(profile.education ?? [])
    );

  const historyCount = viewedJobs.length + searches.length + favoriteJobs.length;

  const tabs: Tab[] = [
    { id: "search", label: "Buscar" },
    {
      id: "profile",
      label: "Perfil",
      badge: hasUnsavedChanges ? (
        <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-warning)]" aria-label="Cambios sin guardar" />
      ) : undefined,
    },
    {
      id: "history",
      label: "Historial",
      badge: historyCount > 0 ? historyCount : undefined,
    },
  ];

  function handleEdit() {
    setDraftRoles(profile.roles ?? []);
    setDraftSalary(profile.salaryExpectation ?? "");
    setDraftSkills(profile.skills ?? []);
    setDraftExperience(profile.experience ?? []);
    setDraftEducation(profile.education ?? []);
    setIsEditing(true);
    setSaveError(null);
  }

  function handleCancel() {
    setIsEditing(false);
    setSaveError(null);
  }

  async function handleSearch() {
    if (searchTerms.length === 0) {
      setSearchError("Agregá al menos un término de búsqueda.");
      return;
    }

    requireAgent(async () => {
      setSearchError(null);
      setIsSearching(true);
      try {
        const platform = ["linkedin"];
        const result = await startSearch({
          platforms: platform,
          searchTerms,
          model: model || undefined,
          maxResults: resultsCount,
        });
        if (!result.searchId) {
          setIsSearching(false);
          setSearchError(result.error ?? "No se pudo iniciar la búsqueda.");
          return;
        }
        setCurrentSearchId(result.searchId);
      } catch (err) {
        setIsSearching(false);
        setSearchError(
          err instanceof Error ? err.message : "No se pudo iniciar la búsqueda.",
        );
      }
    }, "realizar búsquedas en LinkedIn con el agent");
  }

  function handleSearchComplete() {
    if (currentSearchId) {
      router.push(`/jobs?searchId=${currentSearchId}`);
    }
    setIsSearching(false);
    setCurrentSearchId(null);
  }

  function handleSearchFailed(error: string) {
    setSearchError(error);
    setIsSearching(false);
    setCurrentSearchId(null);
  }

  async function handleCvFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    requireAgent(async () => {
      setIsSaving(true);
      setSaveError(null);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const result = await updateCvFromFile(profile.id, fd);
        if (result.success) {
          setIsEditing(false);
          router.refresh();
        } else {
          setSaveError(result.error ?? "No se pudo actualizar el CV");
        }
      } catch {
        setSaveError("No se pudo actualizar el CV");
      } finally {
        setIsSaving(false);
      }
    }, "re-procesar tu CV con el agent");

    if (cvFileInputRef.current) {
      cvFileInputRef.current.value = "";
    }
  }

  async function handleSave(data: ProfileFormState) {
    setIsSaving(true);
    setSaveError(null);
    try {
      const result = await updateProfile(profile.id, {
        name: data.name,
        email: data.email,
        title: data.title || null,
        location: data.location || null,
        skills: draftSkills,
        experience: draftExperience,
        education: draftEducation,
        roles: data.roles ?? [],
        salaryExpectation: data.salaryExpectation || null,
      });
      if (result.success) {
        setIsEditing(false);
        router.refresh();
      } else {
        setSaveError(result.error ?? "No se pudo guardar el perfil");
      }
    } catch {
      setSaveError("No se pudo guardar el perfil");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Container variant="landing" className="py-10">
      <h1 className="text-2xl font-bold text-[var(--color-fg)]">
        Hola, {profile.name || "👋"}
      </h1>

      <DashboardTabs tabs={tabs} active={activeTab} onChange={(id) => setActiveTab(id as TabId)}>
        {/* Tab: Search */}
        <div
          hidden={activeTab !== "search"}
          role="tabpanel"
          id="panel-search"
          aria-labelledby="tab-search"
        >
          <section className="mt-6 card space-y-6">
            <h2 className="text-lg font-semibold text-[var(--color-fg)]">
              Buscar empleos
            </h2>

            <div className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
                Plataforma
              </span>
              <div className="flex flex-wrap gap-2">
                <span className="chip chip-active">LinkedIn</span>
              </div>
            </div>

            <AgentConfig model={model} onModelChange={handleModelChange} />

            <div className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
                Cantidad de resultados
              </span>
              <div className="flex gap-2">
                {RESULT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setResultsCount(opt)}
                    className={`chip ${resultsCount === opt ? "chip-active" : ""}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
                Términos de búsqueda
              </span>
              <SearchChips terms={searchTerms} onChange={setSearchTerms} />
            </div>

            {searchError && (
              <p className="text-sm text-[var(--color-danger)]" role="alert">
                {searchError}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSearch}
                disabled={isSearching}
                className="btn-primary disabled:opacity-60"
              >
                {isSearching ? "Buscando…" : "Buscar"}
              </button>
            </div>
          </section>
        </div>

        {/* Tab: Profile */}
        <div
          hidden={activeTab !== "profile"}
          role="tabpanel"
          id="panel-profile"
          aria-labelledby="tab-profile"
        >
          <section className="mt-6 card space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--color-fg)]">
                Tu perfil
              </h2>
              <div className="flex gap-2">
                <input
                  ref={cvFileInputRef}
                  type="file"
                  accept=".pdf,.txt,application/pdf,text/plain"
                  onChange={handleCvFileSelected}
                  className="hidden"
                  data-testid="cv-file-input"
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => cvFileInputRef.current?.click()}
                  disabled={isSaving}
                >
                  Actualizar CV
                </button>
                {!isEditing ? (
                  <button type="button" className="btn-primary" onClick={handleEdit}>
                    Editar
                  </button>
                ) : null}
              </div>
            </div>

            {saveError && (
              <p className="text-sm text-[var(--color-danger)]" role="alert">
                {saveError}
              </p>
            )}

            {isEditing ? (
              <div className="space-y-8">
                <ProfileForm
                  formRef={profileFormRef}
                  initialData={{
                    name: profile.name,
                    email: profile.email,
                    title: profile.title ?? "",
                    location: profile.location ?? "",
                    roles: draftRoles,
                    salaryExpectation: draftSalary,
                  }}
                  onSave={handleSave}
                  isSaving={isSaving}
                />
                <SkillsSection
                  skills={draftSkills}
                  onChange={setDraftSkills}
                />
                <ExperienceSection
                  experiences={draftExperience}
                  onChange={setDraftExperience}
                />
                <EducationSection
                  educations={draftEducation}
                  onChange={setDraftEducation}
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => profileFormRef.current?.requestSubmit()}
                    disabled={isSaving}
                  >
                    {isSaving ? "Guardando…" : "Guardar"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <ProfileForm
                  initialData={{
                    name: profile.name,
                    email: profile.email,
                    title: profile.title ?? "",
                    location: profile.location ?? "",
                    roles: profile.roles,
                    salaryExpectation: profile.salaryExpectation ?? "",
                  }}
                  readOnly
                />
                <SkillsSection skills={profile.skills ?? []} readOnly />
                <ExperienceSection experiences={profile.experience ?? []} readOnly />
                <EducationSection educations={profile.education ?? []} readOnly />
              </div>
            )}
          </section>
        </div>

        {/* Tab: History */}
        <div
          hidden={activeTab !== "history"}
          role="tabpanel"
          id="panel-history"
          aria-labelledby="tab-history"
        >
          <section className="mt-6 card space-y-4">
            <h2 className="text-lg font-semibold text-[var(--color-fg)]">
              Historial
            </h2>
            <HistoryTabs
              viewedJobs={viewedJobs}
              searches={searches}
              favoriteJobs={favoriteJobs}
            />
          </section>
        </div>
      </DashboardTabs>

      {isSearching && currentSearchId && (
        <SearchProgress
          searchId={currentSearchId}
          onComplete={handleSearchComplete}
          onFailed={handleSearchFailed}
        />
      )}
    </Container>
  );
}

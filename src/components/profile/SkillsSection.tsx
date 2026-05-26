"use client";

import { useState, type KeyboardEvent } from "react";

interface SkillsSectionProps {
  skills: string[];
  onChange: (skills: string[]) => void;
}

export function SkillsSection({ skills, onChange }: SkillsSectionProps) {
  const [input, setInput] = useState("");

  function addSkill() {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
    }
    setInput("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  }

  function removeSkill(skill: string) {
    onChange(skills.filter((s) => s !== skill));
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Skills</h3>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1.5 rounded-[10px] bg-[var(--color-accent)]/10 px-3 py-1 text-sm text-[var(--color-accent)]"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="inline-flex h-4 w-4 items-center justify-center rounded-full text-xs hover:bg-[var(--color-accent)]/20"
              aria-label={`Remove ${skill}`}
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a skill and press Enter"
        className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      />

      <p className="text-xs text-[var(--color-muted)]">
        Press Enter to add a skill
      </p>
    </div>
  );
}

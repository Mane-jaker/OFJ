"use client";

import { useState, type FormEvent } from "react";

export interface ProfileFormState {
  name: string;
  email: string;
  title: string;
  location: string;
}

interface ProfileFormProps {
  initialData?: Partial<ProfileFormState>;
  onSave: (data: ProfileFormState) => Promise<void>;
  isSaving?: boolean;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function ProfileForm({
  initialData,
  onSave,
  isSaving: externalSaving,
}: ProfileFormProps) {
  const [form, setForm] = useState<ProfileFormState>({
    name: initialData?.name ?? "",
    email: initialData?.email ?? "",
    title: initialData?.title ?? "",
    location: initialData?.location ?? "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormState, string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const saving = externalSaving ?? isSaving;

  function validate(): boolean {
    const newErrors: Partial<Record<keyof ProfileFormState, string>> = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSuccess(false);

    if (!validate()) return;

    setIsSaving(true);
    try {
      await onSave(form);
      setSuccess(true);
    } finally {
      setIsSaving(false);
    }
  }

  function updateField(field: keyof ProfileFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="mb-1 block text-sm font-medium text-[var(--color-fg)]"
        >
          Name <span className="text-red-400">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          className={`w-full rounded-[10px] border bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${
            errors.name
              ? "border-red-400"
              : "border-[var(--color-border)]"
          }`}
          placeholder="John Doe"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-400">{errors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-[var(--color-fg)]"
        >
          Email <span className="text-red-400">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          className={`w-full rounded-[10px] border bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${
            errors.email
              ? "border-red-400"
              : "border-[var(--color-border)]"
          }`}
          placeholder="john@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-400">{errors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="title"
          className="mb-1 block text-sm font-medium text-[var(--color-fg)]"
        >
          Professional Title
        </label>
        <input
          id="title"
          type="text"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          placeholder="Senior Software Engineer"
        />
      </div>

      <div>
        <label
          htmlFor="location"
          className="mb-1 block text-sm font-medium text-[var(--color-fg)]"
        >
          Location
        </label>
        <input
          id="location"
          type="text"
          value={form.location}
          onChange={(e) => updateField("location", e.target.value)}
          className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          placeholder="San Francisco, CA"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-[10px] bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Profile"}
      </button>

      {success && (
        <p className="text-center text-sm text-green-400" role="status">
          Profile saved successfully!
        </p>
      )}
    </form>
  );
}

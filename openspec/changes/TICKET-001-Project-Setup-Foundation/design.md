# Design: TICKET-001-Project-Setup-Foundation

## Technical Approach

Greenfield Next.js 15 App Router project. Server components by default; client components only for interactivity (forms, drag-drop, polling). Local SQLite via better-sqlite3 + Drizzle ORM schema-first. PDF generation client-side via react-pdf. All 6 specs drive a single scaffold with 4 DB tables, 5 routes, and ~30 files.

## Architecture Decisions

### Decision: Server vs Client Component Boundary

| Option | Tradeoff | Decision |
|--------|----------|----------|
| All server | Can't handle forms/drag-drop | Rejected |
| All client | Loses SSR, RSC benefits | Rejected |
| **Hybrid — `"use client"` only at leaf interactivity** | Minimal client JS, SSR for layout/content | **Chosen** |

Client boundaries: `UploadZone`, `ProfileForm`, `ExperienceSection`, `SkillsSection`, `EducationSection`, `PlatformSelector`, `AgentConfig`, `SearchOverlay`, `FilterChips`, `JobCard` actions, `CVPreview` (react-pdf). Everything else is server component.

### Decision: Database Access Pattern

| Option | Tradeoff | Decision |
|--------|----------|----------|
| API routes (`/api/*`) | Extra fetch layer, client state sync | Rejected |
| **Server Actions** | Direct server call from forms, co-located logic | **Chosen** |
| tRPC | Overkill for local SQLite | Rejected |

Server Actions in `src/server/*/actions.ts` called from client components. DB queries stay in `service.ts` files for testability.

### Decision: PDF Generation

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Server-side (puppeteer) | Heavy dep, server complexity | Rejected |
| **react-pdf (client)** | Lightweight, works offline, no server | **Chosen** |

CV preview and PDF export both client-side. `CVPreview.tsx` renders react-pdf `<Document>` with profile data.

### Decision: Search Status Polling

| Option | Tradeoff | Decision |
|--------|----------|----------|
| WebSockets | Complexity for local SQLite | Rejected |
| **Client polling (2s interval)** | Simple, sufficient for single-user | **Chosen** |

`SearchOverlay` polls `GET /api/search/:id/status` every 2s until status is `completed` or `failed`.

## Data Flow

```
Landing (/)                     Profile (/profile)
  │                               │
  ├─ Upload PDF ─→ parse text ──→ pre-fill form
  │                               │
  └─ CTA → /profile              ├─ Save ─→ Server Action ─→ DB (profiles)
                                  │
Search (/search)                 Results (/results)
  │                               │
  ├─ Select platforms             ├─ Poll status (2s) ─→ overlay
  ├─ Enter API key (masked)       ├─ On complete ─→ fetch job listings
  ├─ Choose model                 ├─ Filter chips (client state)
  │                               ├─ Apply/Save ─→ Server Action ─→ DB
  └─ Start ─→ Server Action ─→ DB (searches, status=pending)
                                       │
CV (/cv)                            ┌──┘
  │                                 │
  ├─ Fetch profile [+ job listing]  │
  ├─ Render preview (react-pdf)     │
  └─ Download PDF                   │
                                    │
              ┌─────────────────────┘
              ▼
         DB (better-sqlite3, WAL mode)
         src/server/db/data.db
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Create | Dependencies: next, react, drizzle-orm, better-sqlite3, react-pdf, @react-pdf/renderer, tailwindcss, vitest, @testing-library/react |
| `tsconfig.json` | Create | Next.js 15 TS config with path aliases `@/*` → `src/*` |
| `tailwind.config.ts` | Create | Tailwind v4 with oklch design tokens as CSS custom properties |
| `src/app/globals.css` | Create | CSS custom properties: bg, surface, fg, muted, border, accent (oklch), spacing scale, radius, container widths |
| `src/app/layout.tsx` | Create | Root layout: `<Topnav>`, `<main>`, `<Footer>`, system-ui font |
| `src/app/page.tsx` | Create | Landing: Hero, UploadZone, HowItWorks, Features, CTA |
| `src/app/profile/page.tsx` | Create | Profile setup with ProfileForm + progress bar |
| `src/app/search/page.tsx` | Create | Search config with PlatformSelector + AgentConfig |
| `src/app/results/page.tsx` | Create | Results with SearchOverlay, JobCards, FilterChips |
| `src/app/cv/page.tsx` | Create | CV preview + PDF download |
| `src/components/layout/Topnav.tsx` | Create | Sticky nav, blur backdrop, logo + links |
| `src/components/layout/Footer.tsx` | Create | Copyright + nav links |
| `src/components/layout/Container.tsx` | Create | Width-aware container (1120/800/680) |
| `src/components/layout/Section.tsx` | Create | Section wrapper with consistent spacing |
| `src/components/layout/ProgressBar.tsx` | Create | Step 1-2-3 indicator |
| `src/components/landing/Hero.tsx` | Create | Headline, subtitle, CTA → /profile |
| `src/components/landing/UploadZone.tsx` | Create (client) | Drag-drop PDF/text, parse with pdf-parse |
| `src/components/landing/HowItWorks.tsx` | Create | 3-step process cards |
| `src/components/landing/Features.tsx` | Create | 3-card feature grid |
| `src/components/landing/CTA.tsx` | Create | Bottom CTA section |
| `src/components/profile/ProfileForm.tsx` | Create (client) | Form: name, email, title, location |
| `src/components/profile/ExperienceSection.tsx` | Create (client) | Add/edit/remove experience entries |
| `src/components/profile/SkillsSection.tsx` | Create (client) | Tag input for skills |
| `src/components/profile/EducationSection.tsx` | Create (client) | Add/edit/remove education entries |
| `src/components/search/PlatformSelector.tsx` | Create (client) | Toggle cards: LinkedIn, Indeed, OCC |
| `src/components/search/AgentConfig.tsx` | Create (client) | API key input + model dropdown |
| `src/components/results/SearchOverlay.tsx` | Create (client) | Animated loading overlay with polling |
| `src/components/results/JobCard.tsx` | Create (client) | Job card with Apply/Save actions |
| `src/components/results/FilterChips.tsx` | Create (client) | Platform filter chips |
| `src/components/cv/CVPreview.tsx` | Create (client) | react-pdf Document + download button |
| `src/server/db/index.ts` | Create | Drizzle connection, better-sqlite3 init |
| `src/server/db/schema/profiles.ts` | Create | Profiles table schema |
| `src/server/db/schema/searches.ts` | Create | Searches table schema |
| `src/server/db/schema/job-listings.ts` | Create | Job listings table schema |
| `src/server/db/schema/generated-cvs.ts` | Create | Generated CVs table schema |
| `src/server/db/schema/index.ts` | Create | Barrel export all schemas |
| `src/server/profile/service.ts` | Create | Profile CRUD operations |
| `src/server/profile/actions.ts` | Create | Server Actions: createProfile, updateProfile |
| `src/server/agent/service.ts` | Create | Search orchestration (stub for now) |
| `src/server/agent/actions.ts` | Create | Server Actions: startSearch, getSearchStatus |
| `src/server/cv/service.ts` | Create | CV generation + persistence |
| `src/server/cv/actions.ts` | Create | Server Actions: generateCV, saveCV |
| `src/lib/utils.ts` | Create | `cn()` helper (clsx + tailwind-merge) |
| `vitest.config.ts` | Create | Vitest config with jsdom, path aliases |
| `src/test/setup.ts` | Create | RTL setup, jest-dom matchers |

## Interfaces / Contracts

```typescript
// Drizzle schemas (key columns)
// src/server/db/schema/profiles.ts
export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  title: text("title"),
  location: text("location"),
  cvText: text("cv_text"),
  cvFilePath: text("cv_file_path"),
  skills: text("skills", { mode: "json" }).$type<string[]>().default([]),
  experience: text("experience", { mode: "json" }).$type<Experience[]>().default([]),
  education: text("education", { mode: "json" }).$type<Education[]>().default([]),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// src/server/db/schema/searches.ts
export const searches = sqliteTable("searches", {
  id: text("id").primaryKey(),
  profileId: text("profile_id").notNull().references(() => profiles.id),
  status: text("status").notNull().default("pending"), // pending|running|completed|failed
  platforms: text("platforms", { mode: "json" }).$type<string[]>().default([]),
  apiKey: text("api_key"),
  model: text("model"),
  filters: text("filters", { mode: "json" }).$type<Record<string, unknown>>().default({}),
  resultsCount: integer("results_count").default(0),
  startedAt: integer("started_at", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// src/server/db/schema/job-listings.ts
export const jobListings = sqliteTable("job_listings", {
  id: text("id").primaryKey(),
  searchId: text("search_id").notNull().references(() => searches.id),
  platform: text("platform").notNull(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  description: text("description"),
  url: text("url"),
  location: text("location"),
  salaryRange: text("salary_range"),
  matchScore: real("match_score"),
  applied: integer("applied").default(0),
  saved: integer("saved").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// src/server/db/schema/generated-cvs.ts
export const generatedCvs = sqliteTable("generated_cvs", {
  id: text("id").primaryKey(),
  profileId: text("profile_id").notNull().references(() => profiles.id),
  jobListingId: text("job_listing_id").references(() => jobListings.id),
  content: text("content").notNull(),
  filePath: text("file_path"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Server Action signatures
// src/server/profile/actions.ts
"use server"
export async function createProfile(data: ProfileFormData): Promise<{ id: string }>
export async function updateProfile(id: string, data: ProfileFormData): Promise<void>
export async function getProfile(id: string): Promise<Profile | null>

// src/server/agent/actions.ts
"use server"
export async function startSearch(data: SearchConfig): Promise<{ searchId: string }>
export async function getSearchStatus(searchId: string): Promise<{ status: string; resultsCount: number }>

// src/server/cv/actions.ts
"use server"
export async function generateCV(profileId: string, jobListingId?: string): Promise<{ content: string }>
export async function saveCV(data: { profileId: string; jobListingId?: string; content: string }): Promise<{ id: string }>
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Drizzle schemas, service functions, utils | Vitest, direct DB (in-memory SQLite for tests) |
| Component | Form validation, tag input, filter chips | Vitest + RTL, render + userEvent |
| Integration | Profile save flow, search creation | Vitest + RTL, mock Server Actions |
| E2E | (future) Full flow: upload → search → results | Playwright (not in this ticket) |

Vitest config: `environment: "jsdom"`, path aliases matching tsconfig, setup file with `@testing-library/jest-dom`.

## Migration / Rollout

No migration — greenfield project. First `npm run dev` creates `data.db` automatically via better-sqlite3.

## Open Questions

- [ ] PDF text extraction: `pdf-parse` works server-side only. Upload zone needs a Server Action to parse, or use `pdfjs-dist` client-side. Decision needed at implementation.
- [ ] API key encryption: spec says "stored encrypted" — need to decide on approach (AES-256-GCM with env-based key, or simple base64 for MVP).

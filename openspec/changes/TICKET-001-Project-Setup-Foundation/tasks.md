# Tasks: TICKET-001 Project Setup Foundation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 2500–3500 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Foundation + DB) → PR 2 (Layout + Landing) → PR 3 (Profile + Search) → PR 4 (Results + CV + Services) → PR 5 (Tests) |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Project bootstrap, tooling, DB schema | PR 1 | Base branch; no UI yet, pure infra |
| 2 | Layout shell + landing page | PR 2 | Depends on PR 1; standalone reviewable |
| 3 | Profile page + search page | PR 3 | Depends on PR 1, 2; forms + server actions |
| 4 | Results page + CV page + server services | PR 4 | Depends on PR 1–3; wiring + polling |
| 5 | Unit + component tests | PR 5 | Depends on PR 1–4; tests all domains |

## Phase 1: Foundation / Infrastructure

- [x] 1.1 Create `package.json` with dependencies: next@15, react@19, react-dom, typescript, drizzle-orm, better-sqlite3, @react-pdf/renderer, pdf-parse, tailwindcss, clsx, tailwind-merge, nanoid, vitest, @testing-library/react, @testing-library/jest-dom, jsdom, @types/better-sqlite3
- [x] 1.2 Create `tsconfig.json` with Next.js 15 defaults and path alias `"@/*": ["./src/*"]`
- [x] 1.3 Create `next.config.ts` with default Next.js 15 config
- [x] 1.4 Create `tailwind.config.ts` with CSS variable references for oklch design tokens (bg, surface, fg, muted, border, accent), spacing scale, radius tokens, container widths (1120/800/680)
- [x] 1.5 Create `src/app/globals.css` with `@tailwind` directives, CSS custom properties mapping oklch tokens, system-ui font stack, base reset
- [x] 1.6 Create `vitest.config.ts` with `environment: "jsdom"`, path aliases matching tsconfig, setup file reference
- [x] 1.7 Create `src/test/setup.ts` with `@testing-library/jest-dom` matchers and global test utilities
- [x] 1.8 Create `src/lib/utils.ts` with `cn()` helper (clsx + tailwind-merge)
- [x] 1.9 Create `src/server/db/index.ts` with better-sqlite3 init (WAL mode), drizzle connection export, in-memory fallback for tests
- [x] 1.10 Create `src/server/db/schema/profiles.ts` with Drizzle schema: id (text PK), name, email (unique), title, location, cvText, cvFilePath, skills (json string[]), experience (json), education (json), createdAt, updatedAt
- [x] 1.11 Create `src/server/db/schema/searches.ts` with Drizzle schema: id, profileId (FK), status (CHECK pending/running/completed/failed), platforms (json), apiKey, model, filters (json), resultsCount, startedAt, completedAt, createdAt
- [x] 1.12 Create `src/server/db/schema/job-listings.ts` with Drizzle schema: id, searchId (FK), platform, title, company, description, url, location, salaryRange, matchScore (real), applied (int 0/1), saved (int 0/1), createdAt
- [x] 1.13 Create `src/server/db/schema/generated-cvs.ts` with Drizzle schema: id, profileId (FK), jobListingId (FK nullable), content, filePath, createdAt
- [x] 1.14 Create `src/server/db/schema/index.ts` barrel-exporting all four table schemas

## Phase 2: Layout Shell + Landing Page

- [x] 2.1 Create `src/components/layout/Container.tsx` — width-aware wrapper accepting variant `landing` (1120px), `form` (680px), `results` (800px)
- [x] 2.2 Create `src/components/layout/Topnav.tsx` — sticky nav with blur backdrop, CVRise logo, links to /profile, /search, /results
- [x] 2.3 Create `src/components/layout/Footer.tsx` — copyright "© 2026 CVRise" + nav links
- [x] 2.4 Create `src/components/layout/Section.tsx` — section wrapper with consistent vertical spacing
- [x] 2.5 Create `src/components/layout/ProgressBar.tsx` — step 1-2-3 indicator with active/completed states
- [x] 2.6 Create `src/app/layout.tsx` — root layout importing globals.css, rendering Topnav, main slot, Footer, system-ui font
- [x] 2.7 Create `src/components/landing/Hero.tsx` — headline, subtitle, CTA button linking to /profile
- [x] 2.8 Create `src/components/landing/UploadZone.tsx` (client) — drag-drop zone accepting PDF/text, file type validation, error display, calls Server Action for parsing
- [x] 2.9 Create `src/components/landing/HowItWorks.tsx` — 3-step cards: Upload Profile, Configure Search, Get Results
- [x] 2.10 Create `src/components/landing/Features.tsx` — 3-card grid: AI-Powered Search, Smart CV Matching, Multi-Platform
- [x] 2.11 Create `src/components/landing/CTA.tsx` — bottom CTA section with link to /profile
- [x] 2.12 Create `src/app/page.tsx` — landing page composing Hero, UploadZone, HowItWorks, Features, CTA inside Container (landing variant)

## Phase 3: Profile Page + Search Page

- [x] 3.1 Create `src/components/profile/ProfileForm.tsx` (client) — form with name (required), email (required, format validation), title, location; calls createProfile/updateProfile Server Action
- [x] 3.2 Create `src/components/profile/ExperienceSection.tsx` (client) — add/edit/remove experience entries (company, title, start date, end date, description)
- [x] 3.3 Create `src/components/profile/SkillsSection.tsx` (client) — tag input: type skill, press Enter to add, click X to remove
- [x] 3.4 Create `src/components/profile/EducationSection.tsx` (client) — add/edit/remove education entries (institution, degree, field, start year, end year)
- [x] 3.5 Create `src/app/profile/page.tsx` — profile page with ProgressBar (step 1/3), ProfileForm, ExperienceSection, SkillsSection, EducationSection, Save button, success confirmation, navigation to /search on save
- [x] 3.6 Create `src/server/profile/service.ts` — profile CRUD: createProfile, updateProfile, getProfile with updatedAt auto-set
- [x] 3.7 Create `src/server/profile/actions.ts` — Server Actions: createProfile, updateProfile, getProfile, parseCV (accepts PDF, returns extracted text via pdf-parse)
- [x] 3.8 Create `src/components/search/PlatformSelector.tsx` (client) — toggle cards for LinkedIn, Indeed, OCC; at least one required; updates platforms array state
- [x] 3.9 Create `src/components/search/AgentConfig.tsx` (client) — masked API key input (type=password), model dropdown (GPT-4, Claude 3.5, etc.), validation: key required, model required
- [x] 3.10 Create `src/app/search/page.tsx` — search page with ProgressBar (step 2/3), PlatformSelector, AgentConfig, back link to /profile, Start Search button, validation before submission, calls startSearch Server Action, navigates to /results

## Phase 4: Results Page + CV Page + Server Services

- [x] 4.1 Create `src/server/agent/service.ts` — search orchestration stub: createSearch, getSearchStatus, updateSearchStatus (pending→running→completed/failed)
- [x] 4.2 Create `src/server/agent/actions.ts` — Server Actions: startSearch (creates search record, status=pending), getSearchStatus (returns {status, resultsCount})
- [x] 4.3 Create `src/components/results/SearchOverlay.tsx` (client) — animated loading overlay, polls `getSearchStatus` every 2s, dismisses on completed/failed, shows error with retry on failed
- [x] 4.4 Create `src/components/results/JobCard.tsx` (client) — job card: platform badge, match score %, title, company, location, salary, description excerpt, Apply button (opens URL + marks applied), Save button (toggles saved)
- [x] 4.5 Create `src/components/results/FilterChips.tsx` (client) — platform filter chips from results data, click toggles active state, filters visible job cards
- [x] 4.6 Create `src/app/results/page.tsx` — results page with ProgressBar (step 3/3), Container (results variant 800px), SearchOverlay, JobCard list, FilterChips, fetches search + job listings
- [x] 4.7 Create `src/server/cv/service.ts` — CV generation: generateCVContent (stub: formats profile data into CV text), saveCV (persists to generated_cvs table)
- [x] 4.8 Create `src/server/cv/actions.ts` — Server Actions: generateCV (returns formatted content), saveCV (persists, returns id)
- [x] 4.9 Create `src/components/cv/CVPreview.tsx` (client) — react-pdf `<Document>` rendering profile data sections, download button using `@react-pdf/renderer` PDFDownloadLink, match score display when jobListingId provided, error handling with retry
- [x] 4.10 Create `src/app/cv/page.tsx` — CV page fetching profile + optional job listing, rendering CVPreview, download PDF button

## Phase 5: Testing

- [x] 5.1 Write unit tests for `src/server/db/schema/*.ts` — validate Drizzle column definitions, JSON type defaults, FK references, unique constraints
- [x] 5.2 Write unit tests for `src/server/profile/service.ts` — createProfile stores record, updateProfile sets updatedAt, getProfile returns null for missing id, duplicate email rejection
- [x] 5.3 Write unit tests for `src/server/agent/service.ts` — createSearch sets status=pending, status transitions (pending→running→completed), getSearchStatus returns correct state
- [x] 5.4 Write unit tests for `src/server/cv/service.ts` — generateCVContent formats profile sections, saveCV persists record with correct FKs
- [x] 5.5 Write unit tests for `src/lib/utils.ts` — cn() merges classes, handles falsy values, tailwind-merge deduplication
- [x] 5.6 Write component tests for `UploadZone` — accepts PDF, rejects unsupported format, displays error, calls parse callback
- [x] 5.7 Write component tests for `ProfileForm` — validates required fields, validates email format, calls save action, shows success
- [x] 5.8 Write component tests for `SkillsSection` — Enter adds tag, X removes tag, tags render correctly
- [x] 5.9 Write component tests for `PlatformSelector` — click toggles selection, at-least-one validation, platforms array updates
- [x] 5.10 Write component tests for `AgentConfig` — masks API key input, model selection, validates required fields
- [x] 5.11 Write component tests for `FilterChips` — click toggles active state, filters visible items
- [x] 5.12 Write component tests for `JobCard` — renders all fields, Apply button calls handler, Save button toggles state
- [x] 5.13 Write integration test for profile save flow — render ProfileForm, fill fields, submit, verify Server Action called with correct data
- [x] 5.14 Write integration test for search creation — render search page, select platform, enter API key, choose model, submit, verify search created with status=pending

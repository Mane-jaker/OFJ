# Tasks: MVP One-Shot

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 3000–4000 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes (after MVP) |
| Delivery strategy | parallel-batches |
| Subagent model | deepseek (via opencode config) |
| Parent validation | lint + build + test after each batch |

## Execution Batches

```
Batch 1: Phase 0 (schema + theme)
    ↓
Batch 2: Phase 1 (skills) ════ Phase 2 (dashboard + UI)    ← PARALLEL
    ↓
Batch 3: Phase 3 (runner + search)
    ↓
Batch 4: Phase 4 (job listings /jobs)
    ↓
Batch 5: Phase 5 (CV generation)
    ↓
Batch 6: Phase 6 (tests) ════ Phase 7 (docs)               ← PARALLEL
```

## Phase 0 — Schema Cleanup + Theme System

- [ ] 0.1 Remove `api_key` column from `src/server/db/schema/searches.ts`
- [ ] 0.2 Add `search_terms` (text JSON, default `[]`) to searches schema
- [ ] 0.3 Rename `saved` → `is_favorite`, `applied` → `is_viewed` in job_listings schema
- [ ] 0.4 Add `posted_date` (text nullable), `relevance_score` (real nullable) to job_listings
- [ ] 0.5 Add `tailored_summary`, `tailored_skills`, `tailored_experience` to generated_cvs schema
- [ ] 0.6 Update `createTables()` in `src/server/db/index.ts` with new DDL
- [ ] 0.7 Update `src/app/globals.css` with dual theme tokens (dark/light) — Apple clean style
- [ ] 0.8 Create `src/components/layout/ThemeProvider.tsx` — context + localStorage persistence
- [ ] 0.9 Create `src/components/layout/ThemeToggle.tsx` — dark/light toggle button
- [ ] 0.10 Update `src/app/layout.tsx` — wrap with ThemeProvider
- [ ] 0.11 Update `src/components/layout/Topnav.tsx` — add ThemeToggle, Apple clean style
- [ ] 0.12 Update `src/components/search/AgentConfig.tsx` — remove API key input, keep model dropdown
- [ ] 0.13 Remove `apiKey` references from Server Actions and services
- [ ] 0.14 Delete existing `data.db` (schema changed, will recreate on next dev run)

## Phase 1 — opencode Skills (OFJ-7)

- [ ] 1.1 Create `skills/ofj-search.md` — LinkedIn direct URL search, profile keywords, max 2 days, JSON output
- [ ] 1.2 Create `skills/ofj-generate-cv.md` — CV tailoring, JSON output, no invented data

## Phase 2 — Dashboard Home + UI/UX (OFJ-3 + visual improvement)

- [ ] 2.1 Redesign `DashboardContent.tsx` — 3 vertical sections, Apple clean style, responsive
- [ ] 2.2 Create `SearchSection.tsx` — platform, model dropdown, count selector, editable search term chips
- [ ] 2.3 Create `SearchChips.tsx` — add (+), delete (X), edit (double-click) chips
- [ ] 2.4 Create `ProfileSection.tsx` — read mode + edit in-place toggle, save/cancel
- [ ] 2.5 Create `HistoryTabs.tsx` — 3 tabs (Vistas, Búsquedas, Favoritos), empty states
- [ ] 2.6 Update `ProfileForm.tsx` — support read/edit mode switching
- [ ] 2.7 Update `LandingContent.tsx` — better visual hierarchy, minimalist
- [ ] 2.8 Update `Footer.tsx` — minimalist, repo + docs links
- [ ] 2.9 Update `src/app/home/page.tsx` — fetch search history + favorites for tabs
- [ ] 2.10 Remove "Salir" button references

## Phase 3 — Agentic Search + Runner (OFJ-4)

- [ ] 3.1 Create `src/server/agent/runner.ts` — spawn opencode CLI, parse JSON, timeout 5min
- [ ] 3.2 Update `src/server/agent/service.ts` — real search execution, dedup INSERT OR IGNORE
- [ ] 3.3 Update `src/server/agent/actions.ts` — wire runner, status transitions, error handling
- [ ] 3.4 Create `src/components/search/SearchProgress.tsx` — polling overlay every 2s
- [ ] 3.5 Add dry-run mode (`OFJ_DRY_RUN=true`) — mock realistic vacancies for tests
- [ ] 3.6 Wire "Buscar" button in SearchSection → startSearch() → polling → redirect /jobs

## Phase 4 — Job Listings Page (OFJ-5)

- [ ] 4.1 Rename `src/app/results/` → `src/app/jobs/`
- [ ] 4.2 Create `src/app/jobs/page.tsx` — load search results, empty/error states
- [ ] 4.3 Update `JobCard.tsx` — score badge (green/yellow/gray), viewed opacity, favorite toggle
- [ ] 4.4 Add "Ver vacante" — external link + markAsViewed()
- [ ] 4.5 Add favorite toggle with optimistic UI
- [ ] 4.6 Add pagination (scroll infinite or offset)
- [ ] 4.7 Update `FilterChips.tsx` — style alignment with Apple clean
- [ ] 4.8 Add Server Actions: markAsViewed, toggleFavorite

## Phase 5 — CV Generation (OFJ-6)

- [ ] 5.1 Create `src/components/cv/CVDocument.tsx` — react-pdf ATS template (1 col, Helvetica)
- [ ] 5.2 Create `src/components/cv/CVPreview.tsx` — PDF preview + download button
- [ ] 5.3 Update `src/server/cv/service.ts` — real generation via runner + filesystem cache
- [ ] 5.4 Update `src/server/cv/actions.ts` — wire runner, cache, PDF generation
- [ ] 5.5 Update `JobCard.tsx` — functional "Generar CV" button, toggle to "Ver PDF"
- [ ] 5.6 Cache in `~/.ofj/cache/cv-{jobListingId}.pdf`, auto-create folder
- [ ] 5.7 Error handling — error in JobCard + "Reintentar" button

## Phase 6 — Integration Tests (OFJ-8)

- [ ] 6.1 Setup test infra — SQLite :memory:, mock runner with dry-run
- [ ] 6.2 Test: first-time → dashboard (CV upload → profile → redirect /home)
- [ ] 6.3 Test: search flow (profile → search → running → completed → /jobs)
- [ ] 6.4 Test: CV + cache (generate → save → cache → cache hit)
- [ ] 6.5 Test: error handling (runner fails → status failed → UI error)
- [ ] 6.6 Test: dedup (same URL → no duplicate)
- [ ] 6.7 Test: favorites/viewed (toggle → persist → respected in UI)
- [ ] 6.8 Test: profile edit (edit → DB update → reload → visible)

## Phase 7 — Docs & Polish (OFJ-9)

- [ ] 7.1 Create `README.md` — tagline, stack, quickstart, folder structure, features, license
- [ ] 7.2 Create `CONTRIBUTING.md` — dev setup, PR flow, conventions, skills guide
- [ ] 7.3 Create `LICENSE` — MIT
- [ ] 7.4 Update `.gitignore` — node_modules, .next, *.db, ~/.ofj/, .env
- [ ] 7.5 Verify: `git clone && pnpm install && pnpm dev` works clean

# Design: MVP One-Shot

## Architecture Decisions

### Decision: API Keys Removed

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Store in DB (current) | Security risk, unnecessary complexity | Rejected |
| Encrypt in DB | Overkill for single-user local | Rejected |
| **Remove entirely** | opencode CLI handles auth via its own config | **Chosen** |

The `apiKey` column in `searches` table is removed. `AgentConfig` component drops the API key input. opencode CLI uses whatever auth the user configured in `~/.config/opencode/`.

### Decision: Theme System

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Dark only | Limiting for open-source appeal | Rejected |
| Light only | Loses existing dark work | Rejected |
| **Dark + Light toggle** | More work, better for OSS | **Chosen** |

CSS variables with `[data-theme="dark"]` and `[data-theme="light"]` on `<html>`. Toggle persisted in localStorage. Apple clean style: solid colors, rounded chips, subtle borders, no glass/blur effects.

### Decision: Agent Runner

| Option | Tradeoff | Decision |
|--------|----------|----------|
| API route | Extra HTTP layer | Rejected |
| **Server Action + child_process** | Direct, simple, co-located | **Chosen** |
| Queue system | Overkill for single-user | Rejected |

`runner.ts` uses `child_process.spawn('opencode', ['run', skill, '--input', json])`. Server Action creates search record, invokes runner, persists results. Client polls status every 2s.

### Decision: PDF Generation

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Server-side (puppeteer) | Heavy dep | Rejected |
| **react-pdf (client)** | Lightweight, offline, ATS-friendly | **Chosen** |

ATS template: 1 column, Helvetica, no icons, no colors. Cache in `~/.ofj/cache/cv-{jobListingId}.pdf`.

### Decision: Route Naming

`/results` → `/jobs`. Aligns with ticket OFJ-5 naming and is more descriptive.

## Data Flow

```
Landing (/)
  └─ Upload PDF → parse → profile in DB → redirect /home

Dashboard (/home)
  ├─ Search params (platform, model, count, chips)
  ├─ Profile (read/edit in-place)
  └─ History tabs (Vistas, Búsquedas, Favoritos)
       │
       └─ Click "Buscar" → Server Action search()
              ├─ Create search record (status=running)
              ├─ runner.runAgent('ofj-search', {profile, terms, max})
              │    └─ child_process.spawn('opencode', ['run', 'ofj-search', ...])
              ├─ Parse JSON output → INSERT OR IGNORE job_listings (dedup by URL)
              └─ Update search (status=completed)
                    │
                    └─ Client polling → redirect /jobs?searchId=X

Job Listings (/jobs)
  ├─ JobCards with score badge, favorite toggle, viewed flag
  ├─ "Ver vacante" → external link + markAsViewed
  └─ "Generar CV" → Server Action generateCv()
         ├─ runner.runAgent('ofj-generate-cv', {profile, jobDesc})
         ├─ Save to generated_cvs
         ├─ react-pdf template → PDF
         ├─ Cache to ~/.ofj/cache/cv-{id}.pdf
         └─ Button toggles to "Ver PDF" permanently
```

## Schema Changes

### searches table
- REMOVE: `api_key` column
- ADD: `search_terms` (text JSON, default `[]`)
- KEEP: `model` (text nullable — user selects per search)

### job_listings table
- RENAME: `saved` → `is_favorite` (integer default 0)
- RENAME: `applied` → `is_viewed` (integer default 0)
- ADD: `posted_date` (text nullable)
- ADD: `relevance_score` (real nullable) — replaces `match_score`
- KEEP: `url` with UNIQUE constraint for dedup

### generated_cvs table
- ADD: `tailored_summary` (text nullable)
- ADD: `tailored_skills` (text JSON, default `[]`)
- ADD: `tailored_experience` (text JSON, default `[]`)
- KEEP: `content` (raw JSON output from agent)
- KEEP: `file_path` (cache path)

## File Changes

### Phase 0 — Schema + Theme
| File | Action |
|------|--------|
| `src/server/db/schema/searches.ts` | Modify — remove api_key, add search_terms |
| `src/server/db/schema/job-listings.ts` | Modify — rename columns, add posted_date, relevance_score |
| `src/server/db/schema/generated-cvs.ts` | Modify — add tailored fields |
| `src/server/db/index.ts` | Modify — update createTables() DDL |
| `src/app/globals.css` | Modify — dual theme tokens, Apple clean style |
| `src/components/layout/ThemeProvider.tsx` | Create — theme context + localStorage |
| `src/components/layout/ThemeToggle.tsx` | Create — dark/light toggle button |
| `src/components/layout/Topnav.tsx` | Modify — add ThemeToggle |
| `src/components/search/AgentConfig.tsx` | Modify — remove API key input |
| `src/app/layout.tsx` | Modify — wrap with ThemeProvider |

### Phase 1 — Skills
| File | Action |
|------|--------|
| `skills/ofj-search.md` | Create |
| `skills/ofj-generate-cv.md` | Create |

### Phase 2 — Dashboard + UI
| File | Action |
|------|--------|
| `src/components/dashboard/DashboardContent.tsx` | Modify — 3 sections redesign |
| `src/components/dashboard/SearchSection.tsx` | Create |
| `src/components/dashboard/ProfileSection.tsx` | Create |
| `src/components/dashboard/HistoryTabs.tsx` | Create |
| `src/components/dashboard/SearchChips.tsx` | Create — editable term chips |
| `src/components/profile/ProfileForm.tsx` | Modify — in-place edit mode |
| `src/components/layout/Topnav.tsx` | Modify — Apple clean style |
| `src/components/layout/Footer.tsx` | Modify — minimalist |
| `src/components/landing/LandingContent.tsx` | Modify — better hierarchy |
| `src/app/home/page.tsx` | Modify — pass search history data |

### Phase 3 — Agentic Search
| File | Action |
|------|--------|
| `src/server/agent/runner.ts` | Create — child_process spawn wrapper |
| `src/server/agent/service.ts` | Modify — real search execution |
| `src/server/agent/actions.ts` | Modify — wire runner, dedup, timeout |
| `src/components/dashboard/SearchSection.tsx` | Modify — trigger search, polling |
| `src/components/search/SearchProgress.tsx` | Create — polling overlay |

### Phase 4 — Job Listings
| File | Action |
|------|--------|
| `src/app/results/` → `src/app/jobs/` | Rename route |
| `src/app/jobs/page.tsx` | Create — loads search results |
| `src/components/results/JobCard.tsx` | Modify — score badge, favorite, viewed |
| `src/components/results/FilterChips.tsx` | Modify — style alignment |
| `src/server/agent/actions.ts` | Modify — markAsViewed, toggleFavorite |

### Phase 5 — CV Generation
| File | Action |
|------|--------|
| `src/components/cv/CVPreview.tsx` | Create — react-pdf ATS template |
| `src/components/cv/CVDocument.tsx` | Create — PDF document definition |
| `src/server/cv/service.ts` | Modify — real generation via runner + cache |
| `src/server/cv/actions.ts` | Modify — wire runner, cache, react-pdf |
| `src/components/results/JobCard.tsx` | Modify — functional "Generar CV" button |

### Phase 6 — Integration Tests
| File | Action |
|------|--------|
| `tests/integration/first-time-flow.test.ts` | Create |
| `tests/integration/search-flow.test.ts` | Create |
| `tests/integration/cv-cache.test.ts` | Create |
| `tests/integration/error-handling.test.ts` | Create |
| `tests/integration/dedup.test.ts` | Create |
| `tests/integration/favorites-viewed.test.ts` | Create |
| `tests/integration/profile-edit.test.ts` | Create |

### Phase 7 — Docs
| File | Action |
|------|--------|
| `README.md` | Create |
| `CONTRIBUTING.md` | Create |
| `LICENSE` | Create |
| `.gitignore` | Modify — complete |

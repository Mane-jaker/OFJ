# Proposal: MVP One-Shot

## Intent

Implement all remaining OFJ features in a single coordinated effort to reach a functional MVP. The project has foundation (OFJ-1) and landing/CV upload (OFJ-2) complete. Everything else — dashboard, agentic search, job listings, CV generation, skills, tests, docs — is pending.

## Scope

### IN

- Phase 0: Schema cleanup (remove API keys) + theme system (dark/light toggle, Apple clean style)
- Phase 1: opencode skills (ofj-search.md, ofj-generate-cv.md)
- Phase 2: Dashboard home redesign with 3 sections + UI/UX improvements
- Phase 3: Agentic search runner via child_process + opencode CLI
- Phase 4: Job listings page (/jobs) with score badges, favorites, viewed flags
- Phase 5: CV generation with react-pdf ATS template + filesystem cache
- Phase 6: Integration tests for all major flows
- Phase 7: README, CONTRIBUTING, LICENSE, .gitignore

### OUT

- Marketing campaign (OFJ-11 — future iteration)
- Multi-platform support beyond LinkedIn
- Cloud deploy / SaaS
- Authentication / multi-user
- Mobile app
- Notifications

## Approach

Execute in 6 batches with parallelism where phases don't share files. Parent agent (glm-5.2) validates after each batch via lint, build, and tests. Subagents handle implementation per phase.

## Decisions

- LinkedIn search: URL direct, profile keywords, max 2 days posting age
- Visual: dark + light toggle, Apple clean (solid colors, chips, no glass)
- opencode CLI assumed installed; dry-run only for tests
- API keys removed from schema — opencode handles its own auth
- Model selector: simple dropdown per search
- Route: /results renamed to /jobs
- No "Salir" button on dashboard

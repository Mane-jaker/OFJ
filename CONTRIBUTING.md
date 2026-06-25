# Contributing to OFJ

Thanks for your interest in contributing to OFJ! This is an open-source project and all contributions are welcome — bug reports, feature ideas, documentation improvements, and code.

## Development Setup

```bash
git clone https://github.com/user/ofj.git
cd ofj
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Branch Convention

Use one of these prefixes when creating a branch:

- `feature/<short-description>` — new functionality
- `fix/<short-description>` — bug fixes
- `chore/<short-description>` — tooling, deps, refactors, docs

Example: `feature/cv-export-docx`.

## Pull Request Flow

1. Fork the repository
2. Create a branch following the convention above
3. Make your changes, keep commits focused
4. Run `pnpm test` and `pnpm lint` — both must pass
5. Open a Pull Request against `main`
6. Wait for review and address feedback

## Code Conventions

- **ESLint** — enforced via `pnpm lint`. Do not disable rules inline without justification.
- **Prettier** — keep formatting consistent with the existing codebase.
- **Conventional Commits** — use `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:` prefixes in commit messages.
- **TypeScript** — strict types, no `any` unless absolutely necessary and documented.
- **Naming** — `camelCase` for variables/functions, `PascalCase` for components and types.

## Testing

- Run `pnpm test` before submitting a PR — all tests must pass.
- Tests live under `tests/` and colocated with components where applicable.
- Use Vitest + React Testing Library. Add tests for new user-facing behavior.

## Adding a New Skill

OFJ skills are Markdown files consumed by the opencode CLI agent. To add one:

1. Create a `.md` file in the `skills/` directory (e.g. `skills/ofj-cover-letter.md`)
2. Follow the structure of the existing skills (`ofj-search.md`, `ofj-generate-cv.md`):
   - `## Trigger` — when the skill runs
   - `## Input` — expected JSON schema with an example
   - `## Output` — returned JSON schema with an example
   - `## Rules` — constraints the agent must follow
3. Wire the skill into the relevant server service under `src/server/agent/` or `src/server/cv/`.
4. Document it in `README.md` under **Skills**.

## Adding a New Platform

The search skill currently targets LinkedIn only. To add a new platform:

1. Extend the search skill (`skills/ofj-search.md`) to accept a `platform` field and document the supported values.
2. Update the `PlatformSelector` component (`src/components/search/`) to expose the new option.
3. Update the search service (`src/server/agent/`) to pass the platform through to the agent.
4. Ensure returned vacancies use the new `platform` value.

## Project Structure Overview

```
src/
├── app/         # Next.js App Router pages
├── components/  # React components (cv, dashboard, landing, layout, profile, results, search)
├── server/      # Server logic (agent, cv, db, profile)
├── lib/         # Utilities
└── types/       # Type declarations

skills/          # opencode CLI skills
tests/           # Integration tests
```

See [README.md](./README.md) for the full structure description.

## Questions?

Open an issue with the `question` label. Thanks for contributing!

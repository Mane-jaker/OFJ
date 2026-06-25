# OFJ — Open Find Job

**Open-source AI agent that finds jobs for you — locally, privately, for free.**

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Node](https://img.shields.io/badge/Node-20%2B-green.svg)
![Open Source](https://img.shields.io/badge/Open-Source-✓-brightgreen.svg)

OFJ is an open-source AI job search agent. Upload your CV, and OFJ parses it into a structured profile, then uses [opencode](https://opencode.ai) CLI agents to search LinkedIn for relevant vacancies and generate tailored, ATS-friendly CVs — all running locally on your machine.

## Why OFJ?

- **Open-source** — MIT licensed, fully transparent
- **100% local** — no cloud, no accounts, no API keys
- **Agent-powered** — uses opencode CLI to drive the search and CV generation
- **Free** — no subscriptions, no paywalls

## Features

- CV upload with automatic parsing into a structured profile
- AI-powered job search on LinkedIn via opencode agents
- Match scoring for each vacancy
- Tailored CV generation per vacancy (ATS-friendly PDF)
- Search history, favorites, and viewed-job tracking
- Dark / light theme
- Works offline (except for the actual job search)

## Stack

| Layer         | Technology                          |
| ------------- | ----------------------------------- |
| Framework     | Next.js 15 (App Router)             |
| UI            | Tailwind CSS + TypeScript           |
| Database      | SQLite via Drizzle ORM + better-sqlite3 |
| Agent Engine  | opencode CLI                        |
| PDF           | @react-pdf/renderer                 |
| Tests         | Vitest + React Testing Library      |

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 10+
- [opencode](https://opencode.ai) CLI installed globally (for agent-powered search)

## Quickstart

```bash
git clone https://github.com/user/ofj.git
cd ofj
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── page.tsx      # Landing + CV upload
│   ├── home/         # Dashboard
│   └── jobs/         # Job listings
├── components/       # React components
│   ├── cv/           # CV preview + PDF
│   ├── dashboard/    # Dashboard sections
│   ├── landing/      # Landing page
│   ├── layout/       # Layout (nav, footer, theme)
│   ├── profile/      # Profile forms
│   ├── results/      # Job cards, filters
│   └── search/       # Search config, progress
├── server/           # Server-side logic
│   ├── agent/        # Agent runner + search service
│   ├── cv/           # CV generation service
│   ├── db/           # Database connection + schema
│   └── profile/      # Profile parsing + CRUD
├── lib/              # Utilities
└── types/            # Type declarations

skills/               # opencode CLI skills
├── ofj-search.md     # Job search skill
└── ofj-generate-cv.md # CV generation skill

tests/                # Integration tests
```

## Scripts

| Command              | Description         |
| -------------------- | ------------------- |
| `pnpm dev`           | Start dev server    |
| `pnpm build`         | Production build    |
| `pnpm lint`          | ESLint              |
| `pnpm test`          | Run tests           |
| `pnpm test:watch`    | Watch mode tests    |

## How It Works

1. Upload your CV (PDF) — the app parses it into a structured profile
2. Configure search parameters (platform, model, search terms)
3. Click "Buscar" — the opencode agent searches LinkedIn for matching vacancies
4. Browse results with match scores, favorite and track viewed jobs
5. Click "Generar cv" on any vacancy — the agent generates a tailored, ATS-friendly PDF

## Skills

OFJ ships with two opencode CLI skills:

- `ofj-search` — searches LinkedIn Jobs for vacancies matching your profile
- `ofj-generate-cv` — generates a tailored CV for a specific job description

## License

MIT — see [LICENSE](./LICENSE).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

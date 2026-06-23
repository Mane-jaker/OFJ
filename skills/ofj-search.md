# OFJ Search

Search for job vacancies on LinkedIn for the OFJ (Open Find Job) agent.

## Trigger

Search for job vacancies.

## Input

JSON with the following fields:

- `profile`: structured user profile object
  - `name`: string
  - `skills`: array of strings
  - `experience`: array of objects
  - `preferences`: object (e.g. location, remote, job type)
- `searchTerms`: array of search term strings (e.g. `["react", "nextjs", "remote"]`)
- `maxResults`: number — one of `10`, `20`, or `50`

Example input:

```json
{
  "profile": {
    "name": "Jane Doe",
    "skills": ["react", "nextjs", "typescript", "node"],
    "experience": [
      { "title": "Frontend Developer", "company": "Acme", "years": 3 }
    ],
    "preferences": { "remote": true, "location": "EU" }
  },
  "searchTerms": ["react", "nextjs", "remote"],
  "maxResults": 20
}
```

## Output

JSON array of vacancies. Each vacancy has the following shape:

- `title`: string
- `company`: string
- `location`: string
- `url`: string — direct LinkedIn job URL
- `platform`: string — always `"linkedin"`
- `description`: string — job description excerpt
- `postedDate`: string — ISO date `YYYY-MM-DD`
- `relevanceScore`: integer 0-100 — match between profile skills and job description

Example output:

```json
[
  {
    "title": "Senior Frontend Developer",
    "company": "Globex",
    "location": "Remote, EU",
    "url": "https://www.linkedin.com/jobs/view/1234567890",
    "platform": "linkedin",
    "description": "Looking for a React/Next.js engineer to build...",
    "postedDate": "2026-06-22",
    "relevanceScore": 87
  }
]
```

If no vacancies are found, return an empty array:

```json
[]
```

## Rules

- Navigate directly to LinkedIn Jobs URLs constructed from `searchTerms` combined with relevant `profile` keywords.
- Filter vacancies to a maximum of 2 days old: `postedDate >= today - 2 days`.
- Use ONLY LinkedIn as the platform. Do not query or return results from any other platform.
- DO NOT invent vacancies. Only return real jobs actually found on LinkedIn.
- If no matching vacancies are found, return `[]`.
- ALWAYS return valid JSON. No markdown fences, no extra text, no comments.
- `relevanceScore` must be an integer between 0 and 100, computed from the overlap between `profile.skills` and the job description.

# OFJ Generate CV

Generate a tailored CV for a specific job vacancy for the OFJ (Open Find Job) agent.

## Trigger

Generate tailored CV for a job vacancy.

## Input

JSON with the following fields:

- `profile`: structured user profile object
  - `name`: string
  - `summary`: string — current professional summary
  - `skills`: array of strings
  - `experience`: array of objects `{ title, company, dates, bullets }`
- `jobDescription`: string — full job description text

Example input:

```json
{
  "profile": {
    "name": "Jane Doe",
    "summary": "Frontend developer with 3 years building web apps.",
    "skills": ["react", "nextjs", "typescript", "node", "css"],
    "experience": [
      {
        "title": "Frontend Developer",
        "company": "Acme",
        "dates": "2022-2025",
        "bullets": [
          "Built reusable component library in React.",
          "Migrated app to Next.js improving LCP by 30%."
        ]
      }
    ]
  },
  "jobDescription": "We are looking for a Next.js engineer with strong TypeScript skills to lead frontend performance work..."
}
```

## Output

JSON object with the following fields:

- `tailoredSummary`: string — professional summary adjusted to align with the vacancy
- `tailoredSkills`: array of strings — skills reordered to prioritize match with the vacancy
- `tailoredExperience`: array of `{ title, company, dates, bullets }` — experience entries with bullets emphasized for relevance to the vacancy

Example output:

```json
{
  "tailoredSummary": "Next.js engineer with strong TypeScript expertise and a track record of frontend performance optimization across 3 years.",
  "tailoredSkills": ["nextjs", "typescript", "react", "node", "css"],
  "tailoredExperience": [
    {
      "title": "Frontend Developer",
      "company": "Acme",
      "dates": "2022-2025",
      "bullets": [
        "Migrated app to Next.js improving LCP by 30%.",
        "Built reusable component library in React."
      ]
    }
  ]
}
```

## Rules

- Reorder `tailoredSkills` so skills mentioned in the job description come first, preserving the rest afterwards in their original relative order.
- Reorder bullets within each experience entry so the bullets most relevant to the vacancy come first.
- Adjust `tailoredSummary` to align with the job description while staying truthful to the profile.
- DO NOT invent skills, experience entries, or bullets that are not present in the profile.
- DO NOT include education or certifications in the output.
- ALWAYS return valid JSON. No markdown fences, no extra text, no comments.

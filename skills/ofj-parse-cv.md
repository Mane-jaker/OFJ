# OFJ Parse CV

Parse a raw CV text into a structured profile for the OFJ (Open Find Job) agent.

## Trigger

Parse a free-text CV into structured profile fields.

## Input

JSON with the following fields:

- `cvText`: string — full CV raw text (already extracted from PDF or plain text)

Example input:

```json
{
  "cvText": "John Doe\njohn@example.com\nSenior Backend Engineer\nBuenos Aires, AR\n\nSkills:\nJava, Spring Boot, PostgreSQL, AWS, Docker, Kubernetes\n\nExperience:\nSenior Backend Developer, Tech Corp\n2021 - Present\n- Led migration to microservices architecture\n- Reduced API latency by 40%\n\nBackend Developer, Startup Inc\n2018 - 2021\n- Built REST APIs with Spring Boot\nEducation:\nB.Sc. in Computer Science, University of Buenos Aires\n2014 - 2018"
}
```

## Output

JSON object with the following fields:

- `name`: string or null — full name of the candidate
- `email`: string or null — email address
- `title`: string or null — professional title (e.g. "Senior Backend Engineer"). NOT company name, NOT "CV", NOT "Resume"
- `location`: string or null — city, country, or "Remote"
- `skills`: array of strings — ONLY hard skills (languages, frameworks, tools, databases, cloud, platforms). MAX 30 items. Do NOT include soft skills (teamwork, leadership, communication, problem-solving, responsibility, etc.)
- `experience`: array of objects — work history, most recent first. Each entry:
  - `company`: string
  - `title`: string
  - `startDate`: string — ISO YYYY-MM or YYYY
  - `endDate`: string or null — null means current/ongoing
  - `description`: string — concise 1-4 bullet points as ONE string with newline separators
- `education`: array of objects — education history. Each entry:
  - `institution`: string
  - `degree`: string — e.g. "B.Sc.", "M.Sc.", "PhD", "Bachelor"
  - `field`: string — field of study
  - `startYear`: integer
  - `endYear`: integer or null

Example output:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "title": "Senior Backend Engineer",
  "location": "Buenos Aires, AR",
  "skills": ["Java", "Spring Boot", "PostgreSQL", "AWS", "Docker", "Kubernetes"],
  "experience": [
    {
      "company": "Tech Corp",
      "title": "Senior Backend Developer",
      "startDate": "2021",
      "endDate": null,
      "description": "Led migration to microservices architecture\nReduced API latency by 40%"
    },
    {
      "company": "Startup Inc",
      "title": "Backend Developer",
      "startDate": "2018",
      "endDate": "2021",
      "description": "Built REST APIs with Spring Boot"
    }
  ],
  "education": [
    {
      "institution": "University of Buenos Aires",
      "degree": "B.Sc.",
      "field": "Computer Science",
      "startYear": 2014,
      "endYear": 2018
    }
  ]
}
```

## Rules

- Title: extract the professional title only. Reject line that says "CV", "Resume", "Curriculum", company names without role context.
- Location: extract city + country or "Remote". If unclear, return null.
- Skills: ONLY hard skills — programming languages, frameworks, libraries, databases, cloud platforms, tools, DevOps tech. Reject: soft skills, personality traits, generic phrases, "Microsoft Office", "teamwork", "leadership", "problem-solving", "communication", "responsibility", "time management".
  - Good skills: ["TypeScript", "React", "PostgreSQL", "AWS", "Docker", "Kubernetes", "Spring Boot", "Python", "Go", "Terraform"]
  - Bad examples: ["Team player", "Problem solving", "Fast learner", "Microsoft Office", "Responsible"]
- Experience: preserve original order (should be most recent first). Each entry MUST have company + title. If dates are missing, use "" for startDate and null for endDate.
- Education: preserve original order. startYear is required integer. If no year found, use 0.
- description in experience entries: merge bullet points into ONE string separated by newlines (\n). Remove any markdown or bullet characters.
- If the CV text is empty or truly unparseable, return: { "name": null, "email": null, "title": null, "location": null, "skills": [], "experience": [], "education": [] }
- ALWAYS return valid JSON. No markdown fences, no extra text, no comments. ONLY the JSON object.

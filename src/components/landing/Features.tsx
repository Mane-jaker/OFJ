import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";

const features = [
  {
    title: "AI-Powered Search",
    description:
      "Leverage advanced AI models to find job listings that match your unique skills, experience, and career goals across multiple platforms.",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  },
  {
    title: "Smart CV Matching",
    description:
      "Generate CVs tailored to specific job descriptions. Our system highlights the most relevant skills and experience for each opportunity.",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    title: "Multi-Platform",
    description:
      "Search across LinkedIn, Indeed, and OCC Mundial simultaneously. Aggregate results in one place and track applications.",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
        />
      </svg>
    ),
  },
];

export function Features() {
  return (
    <Section id="features">
      <Container variant="landing">
        <h2 className="mb-12 text-center text-3xl font-bold">
          Everything You Need
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[10px] bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                {feature.icon}
              </div>

              <h3 className="mb-3 text-lg font-semibold">{feature.title}</h3>

              <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

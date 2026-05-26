import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";

const steps = [
  {
    number: 1,
    title: "Upload Profile",
    description:
      "Upload your CV in PDF or text format. Our system extracts your skills, experience, and education automatically.",
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
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
    ),
  },
  {
    number: 2,
    title: "Configure Search",
    description:
      "Select job platforms like LinkedIn, Indeed, or OCC. Set your API key and choose your preferred AI model.",
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
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    number: 3,
    title: "Get Results",
    description:
      "Review matched jobs, filter by platform, and generate tailored CVs. Apply directly or save for later.",
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
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <Container variant="landing">
        <h2 className="mb-12 text-center text-3xl font-bold">
          How It Works
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex flex-col items-center rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                {step.icon}
              </div>

              <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-bold text-white">
                {step.number}
              </div>

              <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>

              <p className="text-sm text-[var(--color-muted)]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";

export function CTA() {
  return (
    <Section>
      <Container variant="landing">
        <div className="flex flex-col items-center rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-16 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Find Your Next Role?
          </h2>

          <p className="mb-8 max-w-lg text-[var(--color-muted)]">
            Upload your CV and let AI find the perfect opportunities for you.
            It takes less than a minute.
          </p>

          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-[10px] bg-[var(--color-accent)] px-8 py-3 text-base font-medium text-white transition-opacity hover:opacity-90"
          >
            Start Now
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 4L10 8L6 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </Container>
    </Section>
  );
}

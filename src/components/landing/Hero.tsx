import Link from "next/link";

export function Hero() {
  return (
    <div className="flex flex-col items-center py-20 text-center md:py-32">
      <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
        Find Your Dream Job
        <br />
        <span className="text-[var(--color-accent)]">
          With AI-Powered Precision
        </span>
      </h1>

      <p className="mb-10 max-w-2xl text-lg text-[var(--color-muted)]">
        Upload your CV, configure your search across multiple platforms, and let
        our AI find the perfect opportunities tailored to your skills and
        experience.
      </p>

      <Link
        href="/profile"
        className="inline-flex items-center gap-2 rounded-[10px] bg-[var(--color-accent)] px-8 py-3 text-base font-medium text-white transition-opacity hover:opacity-90"
      >
        Get Started
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
  );
}

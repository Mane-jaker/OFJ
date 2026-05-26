import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] py-8">
      <div className="container-landing flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-[var(--color-muted)]">
          &copy; 2026 CVRise
        </p>

        <nav className="flex items-center gap-6">
          <Link
            href="/profile"
            className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
          >
            Profile
          </Link>
          <Link
            href="/search"
            className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
          >
            Search
          </Link>
          <Link
            href="/results"
            className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
          >
            Results
          </Link>
        </nav>
      </div>
    </footer>
  );
}

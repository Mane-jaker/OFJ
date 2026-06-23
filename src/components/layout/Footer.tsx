import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] py-8">
      <div className="container-landing flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-[var(--color-muted)]">
          &copy; 2026 OFJ — Open source, local, free.
        </p>

        <nav className="flex items-center gap-6">
          <Link
            href="/home"
            className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
          >
            Dashboard
          </Link>
          <Link
            href="/jobs"
            className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
          >
            Jobs
          </Link>
        </nav>
      </div>
    </footer>
  );
}

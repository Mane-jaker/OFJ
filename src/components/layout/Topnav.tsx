import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { AgentStatus } from "./AgentStatus";

export function Topnav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="container-landing flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[var(--color-fg)]">
          OFJ
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/home"
            className="rounded-[10px] px-3 py-1.5 text-sm font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
          >
            Dashboard
          </Link>
          <Link
            href="/jobs"
            className="rounded-[10px] px-3 py-1.5 text-sm font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
          >
            Jobs
          </Link>
          <AgentStatus />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

import Link from "next/link";

const navLinks = [
  { href: "/profile", label: "Profile" },
  { href: "/search", label: "Search" },
  { href: "/results", label: "Results" },
];

export function Topnav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
      <div className="container-landing flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold text-[var(--color-accent)]"
        >
          CVRise
        </Link>

        <div className="flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

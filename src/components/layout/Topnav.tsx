import Link from "next/link";

const navLinks = [
  { href: "/home", label: "Dashboard" },
  { href: "/results", label: "Resultados" },
];

export function Topnav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
      <div className="container-landing flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[var(--color-accent)]">
          OFJ
        </Link>
      </div>
    </nav>
  );
}

import Link from "next/link";

const links = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/shipping-calculator", label: "Calculator" },
  { href: "/pricing", label: "Pricing" },
  { href: "/countries", label: "Countries" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="relative z-20 border-b border-[color:var(--line)] bg-[color:var(--surface)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 md:px-6">
        <Link href="/" className="group flex flex-col">
          <span className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-[color:var(--ink)]">
            IndiRoute
          </span>
          <span className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
            India → World
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-[color:var(--ink-soft)] md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-[color:var(--accent)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-md px-3 py-2 text-sm text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-[color:var(--accent)] px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[color:var(--accent-deep)]"
          >
            Get address
          </Link>
        </div>
      </div>
    </header>
  );
}

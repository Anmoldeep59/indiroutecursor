"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/how-it-works", label: "How it works?" },
  { href: "/shipping-calculator", label: "Shipping Calculator" },
  { href: "/pricing", label: "Pricing" },
  { href: "/countries", label: "Countries" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[color:var(--navy)] text-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
      <div className="sp-container flex items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--orange)] text-sm font-bold text-white">
            IR
          </span>
          <span className="text-xl font-bold tracking-tight">
            Indi<span className="text-[color:var(--orange)]">Route</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-[14px] font-medium lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/90 transition hover:text-[color:var(--orange)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <Link
            href="/login"
            className="rounded-[4px] bg-[color:var(--orange)] px-4 py-2 text-[15px] font-semibold text-white hover:bg-[color:var(--orange-hover)]"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-[4px] border border-white/30 px-4 py-2 text-[15px] font-semibold text-white hover:bg-white/10"
          >
            Sign up
          </Link>
        </div>

        <button
          type="button"
          className="rounded border border-white/30 px-3 py-2 text-sm lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          Menu
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-[color:var(--navy-deep)] px-5 py-4 lg:hidden">
          <div className="flex flex-col gap-3 text-sm">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/login" className="sp-btn-orange mt-2" onClick={() => setOpen(false)}>
              Login
            </Link>
            <Link href="/signup" className="text-center text-[color:var(--orange)]" onClick={() => setOpen(false)}>
              Sign up for free
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

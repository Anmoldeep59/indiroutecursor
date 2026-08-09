"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useAuth } from "@/components/auth/AuthProvider";

const nav = [
  {
    label: "Services",
    href: "/how-it-works",
    children: [
      { href: "/how-it-works", label: "Shop & Ship" },
      { href: "/pricing", label: "Pricing" },
      { href: "/countries", label: "Countries we ship to" },
    ],
  },
  { label: "Shipping Rates", href: "/shipping-calculator" },
  { label: "Assisted Purchase", href: "/assisted-purchase" },
  { label: "How it works?", href: "/how-it-works" },
  { label: "FAQ", href: "/faq" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState<string | null>(null);
  const { user, loading, logout } = useAuth();
  const loggedIn = Boolean(user);

  return (
    <header className="sticky top-0 z-50 bg-[color:var(--navy)] text-white shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
      <div className="h-0.5 w-full bg-gradient-to-r from-[color:var(--saffron)] via-white to-[color:var(--india-green)]" />
      <div className="mx-auto flex max-w-[1140px] items-center justify-between gap-4 px-4 py-2.5 md:px-5">
        <div className="flex items-center gap-3">
          <BrandLogo href={loggedIn ? "/dashboard" : "/"} variant="light" />
          <span className="hidden items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/80 lg:inline-flex">
            <span
              className="h-2.5 w-2.5 rounded-sm bg-gradient-to-b from-[color:var(--saffron)] via-white to-[color:var(--india-green)]"
              aria-hidden
            />
            Based in India
          </span>
        </div>

        <nav className="hidden items-center gap-5 text-[14px] font-medium xl:flex">
          {nav.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => setDrop(item.label)}
              onMouseLeave={() => setDrop(null)}
            >
              <Link
                href={item.href}
                className="inline-flex items-center gap-1 py-2 text-white/95 hover:text-[color:var(--saffron)]"
              >
                {item.label}
                {item.children ? <span className="text-[10px] opacity-70">▾</span> : null}
              </Link>
              {item.children && drop === item.label ? (
                <div className="absolute left-0 top-full z-50 min-w-[210px] rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] py-2 text-[color:var(--ink)] shadow-lg">
                  {item.children.map((child) => (
                    <Link
                      key={child.href + child.label}
                      href={child.href}
                      className="block px-4 py-2 text-sm hover:bg-[color:var(--wash)]"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          {loading ? null : loggedIn ? (
            <>
              <Link href="/dashboard" className="sp-btn-orange !px-4 !py-2 !text-[15px] !font-bold">
                My Dashboard
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="sp-btn-outline-white !px-3 !py-2 !text-sm"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="sp-btn-outline-white !px-4 !py-2 !text-[15px]">
                Login
              </Link>
              <Link href="/signup" className="sp-btn-orange !px-4 !py-2 !text-[15px] !font-bold">
                Get My India Address
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded border border-white/30 px-3 py-2 text-sm text-white xl:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          Menu
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-[color:var(--navy-deep)] px-5 py-4 text-white xl:hidden">
          <div className="flex flex-col gap-3 text-sm">
            {nav.map((item) => (
              <Link key={item.label} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            {loggedIn ? (
              <>
                <Link href="/dashboard" className="sp-btn-orange mt-2 text-center" onClick={() => setOpen(false)}>
                  My Dashboard
                </Link>
                <button type="button" onClick={() => { logout(); setOpen(false); }} className="text-left text-white/80">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
                <Link href="/signup" className="sp-btn-orange mt-2 text-center" onClick={() => setOpen(false)}>
                  Get My India Address
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

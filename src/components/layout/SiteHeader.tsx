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
      { href: "/assisted-purchase", label: "Assisted Purchase" },
      { href: "/pricing", label: "Pricing" },
      { href: "/countries", label: "Countries we ship to" },
    ],
  },
  { label: "Shipping Rates", href: "/shipping-calculator" },
  { label: "Assisted Purchase", href: "/assisted-purchase" },
  { label: "Offers", href: "/pricing", badge: true },
  { label: "How it works?", href: "/how-it-works" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState<string | null>(null);
  const { user, loading, logout } = useAuth();
  const loggedIn = Boolean(user);

  return (
    <header className="sticky top-0 z-50 bg-[color:var(--navy)] text-white shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3 md:px-5">
        <BrandLogo href={loggedIn ? "/dashboard" : "/"} variant="light" />

        <nav className="hidden items-center gap-6 text-[14px] font-medium xl:flex">
          {nav.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => setDrop(item.label)}
              onMouseLeave={() => setDrop(null)}
            >
              <Link
                href={item.href}
                className="relative inline-flex items-center gap-1 py-2 text-white hover:text-[color:var(--saffron)]"
              >
                {item.label}
                {item.badge ? (
                  <span className="absolute -right-2 -top-0.5 h-2 w-2 rounded-full bg-[color:var(--saffron)]" />
                ) : null}
                {item.children ? <span className="text-[10px] opacity-70">▾</span> : null}
              </Link>
              {item.children && drop === item.label ? (
                <div className="absolute left-0 top-full z-50 min-w-[220px] rounded-md border border-[color:var(--line)] bg-white py-2 text-[color:var(--ink)] shadow-xl">
                  {item.children.map((child) => (
                    <Link
                      key={child.href + child.label}
                      href={child.href}
                      className="block px-4 py-2.5 text-sm hover:bg-[color:var(--wash)]"
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
              <Link href="/dashboard" className="sp-btn-orange !rounded-md !px-5 !py-2.5 !text-[15px] !font-bold !text-white">
                DashBoard
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="sp-btn-outline-white !rounded-md !px-3 !py-2 !text-sm"
              >
                Log out
              </button>
            </>
          ) : (
            <Link href="/login" className="sp-btn-orange !rounded-md !px-5 !py-2.5 !text-[15px] !font-bold !text-white">
              DashBoard
            </Link>
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
                <Link href="/dashboard" className="sp-btn-orange mt-2 text-center !text-white" onClick={() => setOpen(false)}>
                  DashBoard
                </Link>
                <button type="button" onClick={() => { logout(); setOpen(false); }} className="text-left text-white/80">
                  Log out
                </button>
              </>
            ) : (
              <Link href="/login" className="sp-btn-orange mt-2 text-center !text-white" onClick={() => setOpen(false)}>
                DashBoard
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

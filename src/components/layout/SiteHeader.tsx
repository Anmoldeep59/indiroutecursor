"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";

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
  {
    label: "Offers",
    href: "/pricing",
    children: [
      { href: "/pricing", label: "Shipping offers" },
      { href: "/prohibited", label: "Prohibited items" },
    ],
  },
  { label: "How it works?", href: "/how-it-works" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 bg-[color:var(--navy)] text-white shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
      <div className="mx-auto flex max-w-[1140px] items-center justify-between gap-4 px-4 py-2.5 md:px-5">
        <BrandLogo />

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
                className="inline-flex items-center gap-1 py-2 text-white/95 hover:text-[color:var(--orange)]"
              >
                {item.label}
                {item.children ? <span className="text-[10px] opacity-70">▾</span> : null}
              </Link>
              {item.children && drop === item.label ? (
                <div className="absolute left-0 top-full z-50 min-w-[210px] rounded-md border border-[color:var(--line)] bg-white py-2 text-[color:var(--navy)] shadow-lg">
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
          <Link
            href="/dashboard"
            className="rounded-[4px] bg-[color:var(--orange)] px-4 py-2 text-[15px] font-bold uppercase tracking-wide text-white hover:bg-[color:var(--orange-hover)]"
          >
            DashBoard
          </Link>
        </div>

        <button
          type="button"
          className="rounded border border-white/30 px-3 py-2 text-sm xl:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          Menu
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-[color:var(--navy-deep)] px-5 py-4 xl:hidden">
          <div className="flex flex-col gap-3 text-sm">
            {nav.map((item) => (
              <div key={item.label}>
                <Link href={item.href} onClick={() => setOpen(false)} className="font-medium">
                  {item.label}
                </Link>
                {item.children ? (
                  <div className="mt-1 ml-3 flex flex-col gap-1 text-white/70">
                    {item.children.map((c) => (
                      <Link key={c.label} href={c.href} onClick={() => setOpen(false)}>
                        {c.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            <Link href="/dashboard" className="sp-btn-orange mt-2 text-center" onClick={() => setOpen(false)}>
              DashBoard
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

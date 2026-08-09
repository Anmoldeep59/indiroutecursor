"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { BrandLogo } from "@/components/brand/BrandLogo";

const mainLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/dashboard/packages", label: "My Packages", icon: "▣" },
  { href: "/dashboard#warehouse", label: "Warehouse Address", icon: "⌂" },
  { href: "/dashboard#ind-id", label: "IND ID", icon: "◆" },
  { href: "/dashboard/ship", label: "Shipping", icon: "✈" },
  { href: "/dashboard/quotes", label: "Quotes", icon: "◷" },
  { href: "/dashboard/tracking", label: "Tracking", icon: "◎" },
  { href: "/dashboard/consolidate", label: "Consolidate", icon: "⧉" },
  { href: "/dashboard/payments", label: "Payments", icon: "💳" },
  { href: "/dashboard/invoices", label: "Invoices", icon: "📄" },
  { href: "/dashboard/notifications", label: "Notifications", icon: "🔔" },
  { href: "/dashboard/support", label: "Support", icon: "💬" },
];

const accountLinks = [
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/addresses", label: "Saved addresses" },
  { href: "/dashboard/security", label: "Security" },
];

const helpLinks = [
  { href: "/prohibited", label: "Prohibited Items" },
  { href: "/faq", label: "FAQ" },
  { href: "/shipping-calculator", label: "Shipping Calculator" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/contact", label: "Contact" },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { logout, profile, emailVerified } = useAuth();

  return (
    <aside className="flex w-full flex-col bg-[color:var(--navy)] text-white md:min-h-screen md:w-[250px]">
      <div className="border-b border-white/10 px-3 py-4">
        <BrandLogo href="/dashboard" variant="light" size="sm" />
        <p className="mt-2 text-[11px] text-white/65">
          {emailVerified && profile?.indId
            ? profile.indId
            : "Verify email for IND ID"}
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {mainLinks.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-[13px] ${
                active
                  ? "bg-[color:var(--chakra)] font-semibold text-white"
                  : "text-white/90 hover:bg-white/10"
              }`}
            >
              <span className="w-4 text-center opacity-80">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}

        <p className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/45">
          Account
        </p>
        {accountLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-[13px] text-white/85 hover:bg-white/10"
          >
            {link.label}
          </Link>
        ))}

        <p className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/45">
          Help
        </p>
        {helpLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-[13px] text-white/85 hover:bg-white/10"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/10 px-4 py-3 text-xs text-white/60">
        <button
          type="button"
          onClick={() => logout()}
          className="font-semibold text-white hover:text-[color:var(--saffron)]"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}

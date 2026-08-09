"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/packages", label: "Packages" },
  { href: "/dashboard/consolidate", label: "Consolidate" },
  { href: "/dashboard/quotes", label: "Quotes" },
  { href: "/dashboard/ship", label: "Ship" },
  { href: "/dashboard/tracking", label: "Tracking" },
  { href: "/dashboard/payments", label: "Payments" },
  { href: "/dashboard/invoices", label: "Invoices" },
  { href: "/dashboard/notifications", label: "Notifications" },
  { href: "/dashboard/support", label: "Support" },
  { href: "/dashboard/addresses", label: "Addresses" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/security", label: "Security" },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { logout, profile, user } = useAuth();

  return (
    <aside className="w-full border-b border-[color:var(--line)] bg-[color:var(--surface)] md:w-64 md:border-b-0 md:border-r">
      <div className="px-4 py-5">
        <Link href="/" className="font-[family-name:var(--font-display)] text-xl">
          IndiRoute
        </Link>
        <p className="mt-1 text-xs text-[color:var(--muted)]">
          {profile?.indId ?? (user?.emailVerified ? "Issuing IND…" : "Verify email")}
        </p>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:overflow-visible">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-sm ${
                active
                  ? "bg-[color:var(--accent-soft)] text-[color:var(--accent-deep)]"
                  : "text-[color:var(--ink-soft)] hover:bg-[color:var(--wash)]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4">
        <button
          type="button"
          onClick={() => logout()}
          className="text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)]"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}

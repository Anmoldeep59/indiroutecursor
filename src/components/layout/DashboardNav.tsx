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
    <aside className="w-full border-b border-[color:var(--line)] bg-[color:var(--navy)] text-white md:w-64 md:border-b-0 md:border-r md:border-[color:var(--navy-deep)]">
      <div className="px-4 py-5">
        <Link href="/" className="text-xl font-bold">
          Indi<span className="text-[color:var(--orange)]">Route</span>
        </Link>
        <p className="mt-1 text-xs text-white/60">
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
              className={`whitespace-nowrap rounded-[4px] px-3 py-2 text-sm ${
                active
                  ? "bg-[color:var(--orange)] font-semibold text-white"
                  : "text-white/80 hover:bg-white/10"
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
          className="text-sm text-white/60 hover:text-[color:var(--orange)]"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}

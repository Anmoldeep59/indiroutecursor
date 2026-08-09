"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

const mainLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/dashboard/packages", label: "Locker", icon: "▣" },
  { href: "/dashboard/ship", label: "Shipments", icon: "✈" },
  { href: "/dashboard/quotes", label: "In Queue", icon: "◷", indent: true },
  { href: "/dashboard/tracking", label: "History / Track", icon: "◎", indent: true },
  { href: "/assisted-purchase", label: "Personal Shopper", icon: "🛒" },
  { href: "/dashboard/tracking", label: "Track Package", icon: "⌕" },
  { href: "/dashboard/consolidate", label: "Consolidate", icon: "⧉" },
  { href: "/dashboard/payments", label: "Payments", icon: "💳" },
  { href: "/dashboard/invoices", label: "Invoices", icon: "📄" },
];

const helpLinks = [
  { href: "/prohibited", label: "Prohibited Items" },
  { href: "/faq", label: "FAQ" },
  { href: "/shipping-calculator", label: "Shipping Calculator" },
  { href: "/how-it-works", label: "Here's your guide" },
  { href: "/contact", label: "Contact Us" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/security", label: "Security" },
  { href: "/dashboard/support", label: "Support" },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { logout, profile } = useAuth();

  return (
    <aside className="flex w-full flex-col bg-[color:var(--navy)] text-white md:min-h-screen md:w-[250px]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-4">
        <Image src="/brand/indiroute-logo.png" alt="" width={34} height={34} />
        <div>
          <p className="text-[15px] font-bold leading-tight">IndiRoute Parcels</p>
          <a href="https://indiroute.co" className="text-[11px] text-[#8ec5ff]">
            indiroute.co
          </a>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {mainLinks.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.label + link.href}
              href={link.href}
              className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-[13px] ${
                link.indent ? "ml-3" : ""
              } ${
                active
                  ? "bg-[#507dbc] font-semibold text-white"
                  : "text-white/85 hover:bg-white/10"
              }`}
            >
              <span className="w-4 text-center opacity-80">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}

        <p className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/45">
          Help
        </p>
        {helpLinks.map((link) => (
          <Link
            key={link.href + link.label}
            href={link.href}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-[13px] text-white/80 hover:bg-white/10"
          >
            {link.label}
          </Link>
        ))}

        {/* Explicitly NO Wallet / Loyalty Points */}
        <p className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/45">
          Your stuff
        </p>
        <Link
          href="/dashboard/addresses"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-[13px] text-white/80 hover:bg-white/10"
        >
          Saved addresses
        </Link>
        <Link
          href="/dashboard/notifications"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-[13px] text-white/80 hover:bg-white/10"
        >
          Notifications
        </Link>
      </nav>

      <div className="border-t border-white/10 px-4 py-3 text-xs text-white/50">
        <p className="mb-2">{profile?.indId ?? "Verify email for IND"}</p>
        <button type="button" onClick={() => logout()} className="hover:text-[color:var(--orange)]">
          Log out
        </button>
      </div>
    </aside>
  );
}

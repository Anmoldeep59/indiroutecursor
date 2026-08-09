"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

const links = [
  { href: "/admin", label: "Ops dashboard" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/receive", label: "Receive" },
  { href: "/admin/packages", label: "Packages" },
  { href: "/admin/unidentified", label: "Unidentified" },
  { href: "/admin/packing", label: "Packing" },
  { href: "/admin/packing/complete", label: "Complete consolidation" },
  { href: "/admin/shipping", label: "Shipping" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/invoices", label: "Invoices" },
  { href: "/admin/rates", label: "AUD rates" },
  { href: "/admin/countries", label: "Countries" },
  { href: "/admin/restricted", label: "Restricted" },
  { href: "/admin/support", label: "Support" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/audit", label: "Audit" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  const pathname = usePathname();
  const { logout, staff } = useAuth();

  return (
    <aside className="w-full border-b border-zinc-800 bg-zinc-950 text-zinc-100 md:w-64 md:border-b-0 md:border-r md:border-zinc-800">
      <div className="px-4 py-5">
        <Link href="/admin" className="text-lg font-semibold tracking-tight">
          IndiRoute Admin
        </Link>
        <p className="mt-1 text-xs text-zinc-400">
          {staff?.role === "super_admin" ? "Super Admin" : "Warehouse Staff"}
        </p>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-sm ${
                active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900"
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
          className="text-sm text-zinc-500 hover:text-zinc-200"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}

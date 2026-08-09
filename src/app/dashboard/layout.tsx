"use client";

import Link from "next/link";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, user } = useAuth();
  const initial = (profile?.displayName || user?.email || "U").charAt(0).toUpperCase();

  return (
    <RequireAuth>
      <div className="flex min-h-screen flex-col bg-[color:var(--ivory)] text-[color:var(--ink)] md:flex-row">
        <DashboardNav />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-end gap-2 border-b border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2.5 md:px-6">
            <Link
              href="/how-it-works"
              className="relative rounded-md border-2 border-[color:var(--saffron)] bg-[color:var(--navy)] px-3 py-1.5 text-xs font-semibold text-white"
            >
              <span className="absolute -left-1 -top-2 rounded bg-red-600 px-1 text-[9px] font-bold text-white">
                NEW
              </span>
              Guide
            </Link>
            <Link
              href="/dashboard/tracking"
              className="rounded-md bg-[color:var(--wash)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ink)]"
            >
              Track Order
            </Link>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--navy)] text-sm font-bold text-white">
              {initial}
            </div>
          </header>
          <div className="flex-1 px-3 py-4 text-[color:var(--ink)] md:px-6 md:py-5">
            {children}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

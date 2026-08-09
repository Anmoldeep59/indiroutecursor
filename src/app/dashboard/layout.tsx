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
          <header className="flex items-center justify-end gap-2 border-b border-[color:var(--line)] bg-[color:var(--navy)] px-4 py-2.5 md:px-6">
            <Link
              href="/how-it-works"
              className="relative rounded-md border-2 border-[color:var(--saffron)] bg-transparent px-3 py-1.5 text-xs font-semibold text-white"
            >
              <span className="absolute -left-1 -top-2 rounded bg-red-600 px-1 text-[9px] font-bold text-white">
                NEW
              </span>
              Here&apos;s your guide!
            </Link>
            <Link
              href="/dashboard/tracking"
              className="rounded-md bg-black/30 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Track Order
            </Link>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-sm font-bold text-white">
              {initial}
            </div>
          </header>
          <div className="dashboard-surface flex-1 px-3 py-4 text-[color:var(--ink)] md:px-6 md:py-5">
            {children}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

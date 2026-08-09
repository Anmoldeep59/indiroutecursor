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
      <div className="flex min-h-screen flex-col bg-[#eef3f8] md:flex-row">
        <DashboardNav />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-end gap-2 border-b border-[#d9e2ec] bg-white px-4 py-2.5 md:px-6">
            <Link
              href="/how-it-works"
              className="relative rounded-md border-2 border-[color:var(--orange)] bg-[color:var(--navy)] px-3 py-1.5 text-xs font-semibold text-white"
            >
              <span className="absolute -left-1 -top-2 rounded bg-red-500 px-1 text-[9px] font-bold">
                NEW
              </span>
              Here&apos;s your guide!
            </Link>
            <Link
              href="/dashboard/tracking"
              className="rounded-md bg-[#e8edf3] px-3 py-1.5 text-xs font-semibold text-[color:var(--navy)]"
            >
              Track Order
            </Link>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--navy)] text-sm font-bold text-white">
              {initial}
            </div>
          </header>
          <div className="flex-1 px-3 py-4 md:px-6 md:py-5">{children}</div>
        </div>
      </div>
    </RequireAuth>
  );
}

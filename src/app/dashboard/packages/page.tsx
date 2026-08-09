"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthProvider";
import { getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { PackageRecord } from "@/lib/types";
import { freeDaysRemaining, storageDueInr } from "@/lib/domain/storage";
import { formatInr } from "@/lib/format";

type Tab = "ready" | "review" | "action" | "all";

export default function PackagesPage() {
  const { user, profile, emailVerified } = useAuth();
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [tab, setTab] = useState<Tab>("ready");

  useEffect(() => {
    if (!isFirebaseClientConfigured() || !user) return;
    const q = query(
      collection(getClientDb(), COLLECTIONS.packages),
      where("userId", "==", user.uid),
      orderBy("updatedAt", "desc"),
    );
    return onSnapshot(q, (snap) =>
      setPackages(snap.docs.map((d) => d.data() as PackageRecord)),
    );
  }, [user]);

  const active = useMemo(
    () => packages.filter((p) => !p.consolidatedIntoId),
    [packages],
  );

  const counts = useMemo(() => {
    const ready = active.filter((p) =>
      ["Awaiting Payment", "Ready to Ship", "Stored"].includes(p.status),
    ).length;
    const review = active.filter((p) =>
      ["Inspection", "Received"].includes(p.status),
    ).length;
    const action = active.filter((p) => p.status === "Action Required").length;
    return { ready, review, action, all: active.length };
  }, [active]);

  const filtered = useMemo(() => {
    if (tab === "all") return active;
    if (tab === "ready")
      return active.filter((p) =>
        ["Awaiting Payment", "Ready to Ship", "Stored"].includes(p.status),
      );
    if (tab === "review")
      return active.filter((p) => ["Inspection", "Received"].includes(p.status));
    return active.filter((p) => p.status === "Action Required");
  }, [active, tab]);

  const lockerId =
    emailVerified && profile?.indId ? profile.indId : "Verify email for IND ID";

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-5 shadow-sm md:p-6">
        <h1 className="text-2xl font-bold text-[color:var(--ink)] md:text-3xl">
          Your Locker : {lockerId}
        </h1>
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[color:var(--line)] pt-4 sm:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
              Total Packages
            </p>
            <p className="mt-1 text-xl font-bold text-[color:var(--ink)]">{counts.all}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
              Ready to Send
            </p>
            <p className="mt-1 text-xl font-bold text-[color:var(--ink)]">{counts.ready}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
              In Review
            </p>
            <p className="mt-1 text-xl font-bold text-[color:var(--ink)]">{counts.review}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
              Action Required
            </p>
            <p className="mt-1 text-xl font-bold text-[color:var(--ink)]">{counts.action}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-2 shadow-sm">
        <div className="flex flex-wrap gap-1">
          {(
            [
              { id: "ready", label: "READY TO SEND", count: counts.ready, dot: "bg-green-500" },
              { id: "review", label: "IN REVIEW", count: counts.review, dot: "bg-orange-400" },
              { id: "action", label: "ACTION REQUIRED", count: counts.action, dot: "bg-red-500" },
              { id: "all", label: "ALL", count: counts.all, dot: "bg-blue-500" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wide ${
                tab === t.id
                  ? "bg-[color:var(--wash)] text-[color:var(--ink)]"
                  : "text-[color:var(--muted)] hover:bg-[color:var(--wash)]/60"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${t.dot}`} />
              {t.label} ({t.count})
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-[#fff3cd] text-5xl">
              📦
            </div>
            <p className="text-sm text-[color:var(--ink-soft)]">
              No packages in this category yet.
            </p>
            <Link href="/how-it-works" className="mt-4 text-sm font-semibold text-[color:var(--chakra)] hover:underline">
              How to shop to your locker →
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((pkg) => (
              <li
                key={pkg.id}
                className="flex justify-between border-b border-[color:var(--line)] pb-3 text-sm last:border-0"
              >
                <div>
                  <Link
                    href={`/dashboard/packages/${pkg.id}`}
                    className="font-semibold text-[color:var(--ink)] hover:underline"
                  >
                    {pkg.barcode}
                  </Link>
                  <p className="text-[color:var(--muted)]">
                    {pkg.status} · {pkg.senderStore || "Unknown store"}
                  </p>
                </div>
                <div className="text-right text-[color:var(--muted)]">
                  {pkg.storedAt ? (
                    <>
                      <p>Free days left: {freeDaysRemaining(pkg.storedAt)}</p>
                      <p>Storage due: {formatInr(storageDueInr(pkg.storedAt))}</p>
                    </>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

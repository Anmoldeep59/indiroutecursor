"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthProvider";
import { VerificationPanel } from "@/components/auth/VerificationPanel";
import { getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { PackageRecord, ShipmentRecord } from "@/lib/types";
import { freeDaysRemaining } from "@/lib/domain/storage";

export default function DashboardHome() {
  const { user, profile, emailVerified, getIdToken, refreshVerification } = useAuth();
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [addressLines, setAddressLines] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);

  const firstName =
    (profile?.displayName || user?.displayName || "there").split(" ")[0] || "there";

  useEffect(() => {
    void refreshVerification();
  }, [refreshVerification]);

  useEffect(() => {
    if (!isFirebaseClientConfigured() || !user) return;
    const pq = query(
      collection(getClientDb(), COLLECTIONS.packages),
      where("userId", "==", user.uid),
      orderBy("updatedAt", "desc"),
      limit(50),
    );
    const sq = query(
      collection(getClientDb(), COLLECTIONS.shipments),
      where("userId", "==", user.uid),
      orderBy("updatedAt", "desc"),
      limit(50),
    );
    const u1 = onSnapshot(
      pq,
      (snap) => setPackages(snap.docs.map((d) => d.data() as PackageRecord)),
      () => setPackages([]),
    );
    const u2 = onSnapshot(
      sq,
      (snap) => setShipments(snap.docs.map((d) => d.data() as ShipmentRecord)),
      () => setShipments([]),
    );
    return () => {
      u1();
      u2();
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void user.reload().then(async () => {
      const token = await getIdToken(true);
      if (token) {
        await fetch("/api/auth/ensure-profile", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ displayName: user.displayName ?? "" }),
        });
      }
    });
  }, [user, getIdToken]);

  useEffect(() => {
    if (!emailVerified || !profile?.indId) {
      setAddressLines(null);
      return;
    }
    void fetch("/api/settings/public", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        indId: profile.indId,
        name: profile.displayName || user?.displayName || "Customer",
      }),
    })
      .then((r) => r.json())
      .then((d) => setAddressLines(d.lines ?? null))
      .catch(() => setAddressLines(null));
  }, [emailVerified, profile?.indId, profile?.displayName, user?.displayName]);

  const counts = useMemo(() => {
    const active = packages.filter((p) => !p.consolidatedIntoId);
    return {
      warehouse: active.filter((p) =>
        ["Stored", "Inspection", "Received"].includes(p.status),
      ).length,
      action: active.filter((p) => p.status === "Action Required").length,
      ready: active.filter((p) =>
        ["Awaiting Payment", "Ready to Ship"].includes(p.status),
      ).length,
      transit: shipments.filter((s) =>
        ["Shipped", "In Transit", "Customs", "Out for Delivery", "Ready to Ship"].includes(
          s.status,
        ),
      ).length,
    };
  }, [packages, shipments]);

  const recent = packages.filter((p) => !p.consolidatedIntoId).slice(0, 5);

  async function copyAll() {
    if (!addressLines?.length) return;
    await navigator.clipboard.writeText(addressLines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4 text-[color:var(--ink)]">
      <VerificationPanel />

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div
            id="ind-id"
            className="scroll-mt-4 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-[color:var(--ink)]">
                  Welcome, {firstName}
                </h1>
                <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
                  Your IndiRoute ID:{" "}
                  <strong className="text-[color:var(--ink)]">
                    {emailVerified && profile?.indId
                      ? profile.indId
                      : "Unlocks after email verification"}
                  </strong>
                </p>
              </div>
              <div className="rounded-full bg-[color:var(--wash)] px-3 py-1 text-xs font-semibold text-[color:var(--ink)]">
                🇮🇳 → 🇦🇺 Beta
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              Overview
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Packages at warehouse"
                value={counts.warehouse}
                href="/dashboard/packages"
                tone="green"
              />
              <StatCard
                label="Awaiting action"
                value={counts.action}
                href="/dashboard/packages"
                tone="saffron"
              />
              <StatCard
                label="Ready to ship"
                value={counts.ready}
                href="/dashboard/ship"
                tone="navy"
              />
              <StatCard
                label="In transit"
                value={counts.transit}
                href="/dashboard/tracking"
                tone="blue"
              />
            </div>
          </div>

          <div className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">
                Recent packages
              </h2>
              <Link
                href="/dashboard/packages"
                className="text-sm font-semibold text-[color:var(--chakra)] hover:underline"
              >
                View locker
              </Link>
            </div>
            <ul className="mt-4 space-y-3">
              {recent.length === 0 ? (
                <li className="rounded-lg bg-[color:var(--wash)] px-4 py-6 text-center text-sm text-[color:var(--ink-soft)]">
                  No packages yet. Shop Indian stores and ship to your IndiRoute address.
                </li>
              ) : (
                recent.map((pkg) => (
                  <li
                    key={pkg.id}
                    className="flex items-center justify-between gap-3 border-t border-[color:var(--line)] pt-3 text-sm"
                  >
                    <div>
                      <Link
                        href={`/dashboard/packages/${pkg.id}`}
                        className="font-semibold text-[color:var(--ink)] hover:underline"
                      >
                        {pkg.barcode}
                      </Link>
                      <p className="text-[color:var(--muted)]">{pkg.status}</p>
                    </div>
                    <div className="text-right text-[color:var(--muted)]">
                      {pkg.storedAt ? (
                        <p>Free days left: {freeDaysRemaining(pkg.storedAt)}</p>
                      ) : null}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              Quick actions
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { href: "/dashboard/ship", label: "Ship package" },
                { href: "/dashboard/consolidate", label: "Consolidate" },
                { href: "/dashboard/tracking", label: "Tracking" },
                { href: "/dashboard/support", label: "Support" },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-4 text-sm font-semibold text-[color:var(--ink)] shadow-sm hover:border-[color:var(--saffron)]"
                >
                  {a.label} →
                </Link>
              ))}
            </div>
          </div>
        </div>

        <aside
          id="warehouse"
          className="scroll-mt-4 overflow-hidden rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] shadow-sm"
        >
          <div className="bg-[color:var(--india-green)] px-4 py-3 text-center text-sm font-bold text-white">
            Your India warehouse address
          </div>
          <div className="space-y-3 p-4">
            {!emailVerified ? (
              <p className="rounded-md bg-[color:var(--wash)] p-3 text-sm text-[color:var(--ink-soft)]">
                Verify your email to reveal your permanent IND ID and warehouse address.
              </p>
            ) : (
              <>
                <button
                  type="button"
                  disabled={!addressLines}
                  onClick={copyAll}
                  className="sp-btn-orange w-full !px-3 !py-3 !text-sm !font-bold"
                >
                  {copied ? "Copied!" : "Copy Full Address"}
                </button>
                {addressLines ? (
                  addressLines.map((line) => (
                    <div
                      key={line}
                      className="rounded-md border border-[color:var(--line)] bg-[color:var(--ivory)] px-3 py-2 text-sm text-[color:var(--ink)]"
                    >
                      {line}
                    </div>
                  ))
                ) : (
                  <p className="rounded-md bg-amber-50 p-3 text-xs text-amber-950">
                    IND: {profile?.indId}. Warehouse street lines need founder env configuration.
                  </p>
                )}
                <p className="text-[11px] leading-relaxed text-[color:var(--muted)]">
                  Put your name + IND on the Indian checkout label (often Address Line 2).
                </p>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  tone,
}: {
  label: string;
  value: number;
  href: string;
  tone: "green" | "saffron" | "navy" | "blue";
}) {
  const bg = {
    green: "bg-[color:var(--india-green)] text-white",
    saffron: "bg-[color:var(--saffron)] text-[#0a1b30]",
    navy: "bg-[color:var(--navy)] text-white",
    blue: "bg-[color:var(--chakra)] text-white",
  }[tone];
  return (
    <Link
      href={href}
      className={`rounded-xl ${bg} p-4 shadow-sm transition hover:opacity-95`}
    >
      <p className="text-[11px] font-bold uppercase tracking-wide opacity-90">{label}</p>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
    </Link>
  );
}

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
  const [copiedLine, setCopiedLine] = useState<string | null>(null);

  const firstName =
    (profile?.displayName || user?.displayName || "there").split(" ")[0] || "there";
  const displayName = profile?.displayName || user?.displayName || "Customer";

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
        name: displayName,
      }),
    })
      .then((r) => r.json())
      .then((d) => setAddressLines(d.lines ?? null))
      .catch(() => setAddressLines(null));
  }, [emailVerified, profile?.indId, displayName]);

  const counts = useMemo(() => {
    const active = packages.filter((p) => !p.consolidatedIntoId);
    return {
      warehouse: active.filter((p) =>
        ["Stored", "Inspection", "Received"].includes(p.status),
      ).length,
      transit: shipments.filter((s) =>
        ["Shipped", "In Transit", "Customs", "Out for Delivery", "Ready to Ship"].includes(
          s.status,
        ),
      ).length,
      ready: active.filter((p) =>
        ["Awaiting Payment", "Ready to Ship"].includes(p.status),
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

  async function copyLine(line: string) {
    await navigator.clipboard.writeText(line);
    setCopiedLine(line);
    setTimeout(() => setCopiedLine(null), 1500);
  }

  const addressFields = addressLines
    ? addressLines.map((line, i) => ({
        label:
          i === 0
            ? "Name + IND"
            : i === addressLines.length - 1
              ? "Country"
              : i === 1
                ? "Address Line 1"
                : i === 2
                  ? "Address Line 2"
                  : "City / Postal",
        value: line,
      }))
    : [];

  return (
    <div className="space-y-4 text-[color:var(--ink)]">
      <VerificationPanel />

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {/* Welcome card */}
          <div
            id="ind-id"
            className="scroll-mt-4 rounded-xl bg-white p-5 shadow-sm md:p-6"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[color:var(--ink)]">
                  Welcome {firstName}
                </h1>
                <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
                  Your Locker ID:{" "}
                  <strong className="text-[color:var(--ink)]">
                    {emailVerified && profile?.indId
                      ? profile.indId
                      : "Unlocks after email verification"}
                  </strong>
                </p>
              </div>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center rounded-md bg-[color:var(--teal)] px-5 py-2.5 text-sm font-bold text-white hover:opacity-95"
              >
                How it works
              </Link>
            </div>
          </div>

          {/* Shipment overview */}
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--ink-soft)]">
              Your Shipment Overview
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <OverviewCard
                tone="green"
                icon="📦"
                value={counts.warehouse}
                label="Packages in Locker"
                cta="View Locker"
                href="/dashboard/packages"
              />
              <OverviewCard
                tone="salmon"
                icon="🚚"
                value={counts.transit}
                label="Shipments in Transit"
                cta="Track Now"
                href="/dashboard/tracking"
              />
              <OverviewCard
                tone="sky"
                icon="🛒"
                value={counts.ready}
                label="Ready to Ship"
                cta="Create Order"
                href="/dashboard/ship"
              />
            </div>
          </div>

          {/* Recent packages / locker preview */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[color:var(--ink-soft)]">
                Locker
              </h2>
              <Link
                href="/dashboard/packages"
                className="text-sm font-semibold text-[color:var(--chakra)] hover:underline"
              >
                View all
              </Link>
            </div>
            <ul className="mt-4 space-y-3">
              {recent.length === 0 ? (
                <li className="flex flex-col items-center justify-center rounded-lg bg-[color:var(--wash)] px-4 py-10 text-center">
                  <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-[#fff3cd] text-4xl">
                    📭
                  </div>
                  <p className="text-sm text-[color:var(--ink-soft)]">
                    No packages yet. Shop Indian stores and ship to your IndiRoute address.
                  </p>
                </li>
              ) : (
                recent.map((pkg) => (
                  <li
                    key={pkg.id}
                    className="flex items-center justify-between gap-3 border-t border-[color:var(--line)] pt-3 text-sm first:border-0 first:pt-0"
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
        </div>

        {/* Indian Virtual Address panel */}
        <aside
          id="warehouse"
          className="scroll-mt-4 overflow-hidden rounded-xl bg-white shadow-sm"
        >
          <div className="relative bg-[color:var(--teal)] px-4 py-3 text-center text-sm font-bold text-white">
            <span className="absolute -left-1 top-2 rotate-[-12deg] rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white shadow">
              New Address
            </span>
            Your Indian Virtual Address
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
                  className="sp-btn-orange w-full !rounded-md !px-3 !py-3 !text-sm !font-bold !text-white disabled:opacity-50"
                >
                  {copied ? "Copied!" : "Copy Full Address"}
                </button>
                {addressFields.length > 0 ? (
                  addressFields.map((f) => (
                    <div key={f.label + f.value}>
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
                        {f.label}
                      </p>
                      <div className="flex items-center gap-2 rounded-md border border-[color:var(--line)] bg-[color:var(--wash)] px-3 py-2">
                        <p className="min-w-0 flex-1 truncate text-sm text-[color:var(--ink)]">
                          {f.value}
                        </p>
                        <button
                          type="button"
                          onClick={() => copyLine(f.value)}
                          className="shrink-0 text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                          title="Copy"
                          aria-label={`Copy ${f.label}`}
                        >
                          {copiedLine === f.value ? "✓" : "⧉"}
                        </button>
                      </div>
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

function OverviewCard({
  tone,
  icon,
  value,
  label,
  cta,
  href,
}: {
  tone: "green" | "salmon" | "sky";
  icon: string;
  value: number;
  label: string;
  cta: string;
  href: string;
}) {
  const bg = {
    green: "dash-card-green",
    salmon: "dash-card-salmon",
    sky: "dash-card-sky",
  }[tone];

  return (
    <div className={`rounded-xl ${bg} p-5 text-white shadow-sm`}>
      <div className="text-3xl" aria-hidden>
        {icon}
      </div>
      <p className="mt-3 text-4xl font-extrabold leading-none">{value}</p>
      <p className="mt-2 text-xs font-bold uppercase tracking-wide opacity-95">{label}</p>
      <Link
        href={href}
        className="mt-4 inline-flex rounded-md bg-[#3b82c4] px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:opacity-95"
      >
        {cta}
      </Link>
    </div>
  );
}

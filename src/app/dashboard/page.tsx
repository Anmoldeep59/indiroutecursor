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
import { getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { PackageRecord, ShipmentRecord } from "@/lib/types";

export default function DashboardHome() {
  const { user, profile, resendVerification, getIdToken } = useAuth();
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [addressLines, setAddressLines] = useState<string[] | null>(null);
  const verified = Boolean(user?.emailVerified || profile?.emailVerified);
  const name = profile?.displayName || user?.displayName || "there";

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
    const u1 = onSnapshot(pq, (snap) =>
      setPackages(snap.docs.map((d) => d.data() as PackageRecord)),
      () => setPackages([]),
    );
    const u2 = onSnapshot(sq, (snap) =>
      setShipments(snap.docs.map((d) => d.data() as ShipmentRecord)),
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
      const token = await getIdToken();
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
    if (!verified || !profile?.indId) {
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
  }, [verified, profile?.indId, profile?.displayName, user?.displayName]);

  const lockerCount = useMemo(
    () =>
      packages.filter(
        (p) =>
          !p.consolidatedIntoId &&
          ["Stored", "Action Required", "Awaiting Payment", "Consolidation Requested", "Packing"].includes(
            p.status,
          ),
      ).length,
    [packages],
  );
  const transitCount = useMemo(
    () =>
      shipments.filter((s) =>
        ["Shipped", "In Transit", "Customs", "Out for Delivery", "Ready to Ship"].includes(
          s.status,
        ),
      ).length,
    [shipments],
  );

  const addressFields = useMemo(() => {
    if (!addressLines?.length) return null;
    return {
      name: addressLines[0] ?? "",
      line1: addressLines[1] ?? "",
      line2: addressLines[2] ?? "",
      cityLine: addressLines[3] ?? "",
      country: addressLines[4] ?? "India",
    };
  }, [addressLines]);

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-4">
      {!verified ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Verify your email to unlock your IND ID and warehouse address.{" "}
          <button type="button" className="font-semibold underline" onClick={() => resendVerification()}>
            Resend verification
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {/* Welcome — NO wallet / loyalty */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h1 className="text-2xl font-bold text-[color:var(--navy)]">
              Welcome {name}
            </h1>
            <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
              Your Locker ID:{" "}
              <strong className="text-[color:var(--navy)]">
                {verified && profile?.indId ? profile.indId : "Hidden until verified"}
              </strong>
            </p>
            <p className="mt-3 text-xs text-[color:var(--muted)]">
              No wallet · No loyalty points · Pay only when shipping via Stripe
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              Your shipment overview
            </h2>
            <div className="grid gap-3 md:grid-cols-3">
              <OverviewCard
                tone="teal"
                title="Packages in Locker"
                value={String(lockerCount)}
                icon="📦"
                cta="View Locker"
                href="/dashboard/packages"
              />
              <OverviewCard
                tone="peach"
                title="Shipments in Transit"
                value={String(transitCount)}
                icon="🚚"
                cta="Track Now"
                href="/dashboard/tracking"
              />
              <OverviewCard
                tone="sky"
                title="Personal Shopper"
                value="P1"
                icon="🛒"
                cta="Coming Soon"
                href="/assisted-purchase"
              />
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              Quick actions
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { href: "/dashboard/ship", label: "Ship package" },
                { href: "/dashboard/consolidate", label: "Consolidate" },
                { href: "/shipping-calculator", label: "Calculator" },
                { href: "/dashboard/support", label: "Support" },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="rounded-xl bg-white px-4 py-4 text-sm font-semibold text-[color:var(--navy)] shadow-sm hover:bg-[#f8fafc]"
                >
                  {a.label} →
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Indian Virtual Address — Shoppre style */}
        <aside className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="relative bg-[#2bbbad] px-4 py-3 text-center text-sm font-bold text-white">
            Your Indian Virtual Address
            <span className="absolute right-2 top-1 rounded bg-red-500 px-1.5 text-[9px] font-bold">
              NEW
            </span>
          </div>
          <div className="space-y-3 p-4">
            <button
              type="button"
              disabled={!addressLines}
              onClick={() => addressLines && copyText(addressLines.join("\n"))}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#f7aa18] px-3 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              ⧉ Copy Full Address
            </button>

            {!verified ? (
              <p className="text-sm text-[color:var(--muted)]">
                Verify email to reveal your address.
              </p>
            ) : !addressFields ? (
              <p className="rounded-md bg-amber-50 p-3 text-xs text-amber-900">
                [FOUNDER INPUT REQUIRED] Warehouse address lines are not configured in env yet.
                Your IND ID is still: {profile?.indId}
              </p>
            ) : (
              <>
                <AddressRow label="Name" value={addressFields.name} onCopy={copyText} />
                <AddressRow label="Address Line 1" value={addressFields.line1} onCopy={copyText} />
                <AddressRow label="Address Line 2" value={addressFields.line2} onCopy={copyText} />
                <AddressRow label="City / State / Postal" value={addressFields.cityLine} onCopy={copyText} />
                <AddressRow label="Country" value={addressFields.country} onCopy={copyText} />
              </>
            )}
            <p className="text-[11px] leading-relaxed text-[color:var(--muted)]">
              Put your name and IND on the Indian checkout label (often Address Line 2).
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function OverviewCard({
  tone,
  title,
  value,
  icon,
  cta,
  href,
}: {
  tone: "teal" | "peach" | "sky";
  title: string;
  value: string;
  icon: string;
  cta: string;
  href: string;
}) {
  const top = {
    teal: "bg-[#2bbbad]",
    peach: "bg-[#f0a58e]",
    sky: "bg-[#7ec8e3]",
  }[tone];
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      <div className={`${top} px-4 py-5 text-center text-white`}>
        <p className="text-[11px] font-bold uppercase tracking-wide">{title}</p>
        <p className="mt-2 text-4xl">{icon}</p>
        <p className="mt-1 text-3xl font-extrabold">{value}</p>
      </div>
      <div className="bg-[#eef6ff] p-3 text-center">
        <Link
          href={href}
          className="inline-block rounded bg-[color:var(--navy)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}

function AddressRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: (v: string) => void;
}) {
  if (!value) return null;
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold text-[color:var(--muted)]">{label}</p>
      <div className="flex items-center gap-2">
        <div className="min-h-[38px] flex-1 rounded-md border border-[#d9e2ec] bg-[#f8fafc] px-3 py-2 text-sm text-[color:var(--navy)]">
          {value}
        </div>
        <button
          type="button"
          onClick={() => onCopy(value)}
          className="rounded-md border border-[#d9e2ec] px-2 py-2 text-xs text-[color:var(--muted)] hover:bg-[color:var(--wash)]"
          aria-label={`Copy ${label}`}
        >
          ⧉
        </button>
      </div>
    </div>
  );
}

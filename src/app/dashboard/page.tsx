"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthProvider";
import { Alert, Button, PageTitle, Panel } from "@/components/ui/ui";
import { getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { FROZEN } from "@/lib/config/frozen";
import type { PackageRecord } from "@/lib/types";
import { freeDaysRemaining } from "@/lib/domain/storage";
import Link from "next/link";

export default function DashboardHome() {
  const { user, profile, resendVerification, getIdToken } = useAuth();
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [addressLines, setAddressLines] = useState<string[] | null>(null);
  const verified = Boolean(user?.emailVerified || profile?.emailVerified);

  useEffect(() => {
    if (!isFirebaseClientConfigured() || !user) return;
    const q = query(
      collection(getClientDb(), COLLECTIONS.packages),
      where("userId", "==", user.uid),
      orderBy("updatedAt", "desc"),
      limit(10),
    );
    return onSnapshot(
      q,
      (snap) => setPackages(snap.docs.map((d) => d.data() as PackageRecord)),
      () => setPackages([]),
    );
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void user.reload().then(async () => {
      const token = await getIdToken();
      if (token) {
        await fetch("/api/auth/ensure-profile", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
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

  return (
    <div>
      <PageTitle
        title="Dashboard"
        subtitle="Shop in India. We deliver to Australia."
      />
      {!verified ? (
        <Alert tone="warn">
          Verify your email to unlock your IND ID and warehouse address.{" "}
          <button type="button" className="underline" onClick={() => resendVerification()}>
            Resend verification
          </button>
        </Alert>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Panel>
          <h2 className="text-sm uppercase tracking-[0.12em] text-[color:var(--muted)]">
            My IndiRoute ID
          </h2>
          {verified && profile?.indId ? (
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl">
              {profile.indId}
            </p>
          ) : (
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Hidden until email is verified.
            </p>
          )}
        </Panel>
        <Panel>
          <h2 className="text-sm uppercase tracking-[0.12em] text-[color:var(--muted)]">
            Warehouse address
          </h2>
          {addressLines ? (
            <div className="mt-2 space-y-1 text-sm">
              {addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
              <Button
                type="button"
                variant="secondary"
                className="mt-3"
                onClick={() => navigator.clipboard.writeText(addressLines.join("\n"))}
              >
                Copy address
              </Button>
              <p className="mt-3 text-xs text-[color:var(--muted)]">
                Put your name and {profile?.indId} on the Indian checkout label (often
                Address Line 2).
              </p>
            </div>
          ) : verified ? (
            <Alert tone="warn" >
              [FOUNDER INPUT REQUIRED] Warehouse address lines are not configured in env.
            </Alert>
          ) : (
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Available after verification.
            </p>
          )}
        </Panel>
      </div>

      <Panel className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl">Recent packages</h2>
          <Link href="/dashboard/packages" className="text-sm text-[color:var(--accent)]">
            View all
          </Link>
        </div>
        <ul className="mt-4 space-y-3">
          {packages.length === 0 ? (
            <li className="text-sm text-[color:var(--muted)]">No packages yet.</li>
          ) : (
            packages.map((pkg) => (
              <li key={pkg.id} className="flex justify-between border-t border-[color:var(--line)] pt-3 text-sm">
                <div>
                  <Link href={`/dashboard/packages/${pkg.id}`} className="font-medium">
                    {pkg.barcode}
                  </Link>
                  <p className="text-[color:var(--muted)]">{pkg.status}</p>
                </div>
                <div className="text-right text-[color:var(--muted)]">
                  {pkg.storedAt ? (
                    <p>Free days left: {freeDaysRemaining(pkg.storedAt)}</p>
                  ) : null}
                  <p>Free window: {FROZEN.freeStorageDays} days</p>
                </div>
              </li>
            ))
          )}
        </ul>
      </Panel>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageTitle, Panel } from "@/components/ui/ui";
import { getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { PackageRecord } from "@/lib/types";
import { freeDaysRemaining, storageDueInr } from "@/lib/domain/storage";
import { formatInr } from "@/lib/format";

export default function PackagesPage() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  useEffect(() => {
    if (!isFirebaseClientConfigured() || !user) return;
    const q = query(
      collection(getClientDb(), COLLECTIONS.packages),
      where("userId", "==", user.uid),
      orderBy("updatedAt", "desc"),
    );
    return onSnapshot(q, (snap) => setPackages(snap.docs.map((d) => d.data() as PackageRecord)));
  }, [user]);
  return (
    <div>
      <PageTitle title="My packages" subtitle="No wallet. Storage accrues per package after day 20." />
      <Panel>
        <ul className="space-y-3">
          {packages.filter((p) => !p.consolidatedIntoId).map((pkg) => (
            <li key={pkg.id} className="flex justify-between border-b border-[color:var(--line)] pb-3 text-sm">
              <div>
                <Link href={`/dashboard/packages/${pkg.id}`} className="font-medium">{pkg.barcode}</Link>
                <p className="text-[color:var(--muted)]">{pkg.status} · {pkg.senderStore || "Unknown store"}</p>
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
          {packages.length === 0 ? <li className="text-sm text-[color:var(--muted)]">No packages yet.</li> : null}
        </ul>
      </Panel>
    </div>
  );
}

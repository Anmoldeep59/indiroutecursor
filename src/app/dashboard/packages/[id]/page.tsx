"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { PageTitle, Panel, Alert } from "@/components/ui/ui";
import { getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { PackageRecord } from "@/lib/types";
import { freeDaysRemaining, storageDueInr } from "@/lib/domain/storage";
import { formatInr } from "@/lib/format";

export default function PackageDetailPage() {
  const params = useParams<{ id: string }>();
  const [pkg, setPkg] = useState<PackageRecord | null>(null);
  useEffect(() => {
    if (!isFirebaseClientConfigured() || !params.id) return;
    return onSnapshot(doc(getClientDb(), COLLECTIONS.packages, params.id), (snap) => {
      setPkg(snap.exists() ? (snap.data() as PackageRecord) : null);
    });
  }, [params.id]);
  if (!pkg) return <p className="text-sm text-[color:var(--muted)]">Loading package…</p>;
  return (
    <div>
      <PageTitle title={pkg.barcode} subtitle={pkg.status} />
      {pkg.actionRequiredReason ? <Alert tone="warn">{pkg.actionRequiredReason}</Alert> : null}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Panel className="space-y-2 text-sm">
          <p>Weight: {pkg.weightKg ?? "—"} kg</p>
          <p>Dims: {pkg.lengthCm ?? "—"} × {pkg.widthCm ?? "—"} × {pkg.heightCm ?? "—"} cm</p>
          <p>Store: {pkg.senderStore || "—"}</p>
          <p>Inbound tracking: {pkg.inboundTracking || "—"}</p>
          <p>Condition: {pkg.condition || "—"}</p>
          {pkg.storedAt ? (
            <>
              <p>Stored at: {new Date(pkg.storedAt).toLocaleString()}</p>
              <p>Free days left: {freeDaysRemaining(pkg.storedAt)}</p>
              <p>Storage accrued: {formatInr(storageDueInr(pkg.storedAt))}</p>
            </>
          ) : null}
        </Panel>
        <Panel>
          <h2 className="font-medium">Photos</h2>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
            {pkg.photos.map((p) => (
              <li key={p.id}>{p.kind} · {p.storagePath}</li>
            ))}
            {pkg.photos.length === 0 ? <li>No photos</li> : null}
          </ul>
          <p className="mt-3 text-xs text-[color:var(--muted)]">
            Photo URLs are served via authorized storage access in production.
          </p>
        </Panel>
      </div>
    </div>
  );
}

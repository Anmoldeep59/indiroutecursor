"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageTitle, Panel, Alert } from "@/components/ui/ui";
import { getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { ShipmentRecord } from "@/lib/types";

export default function TrackingPage() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  useEffect(() => {
    if (!isFirebaseClientConfigured() || !user) return;
    const q = query(
      collection(getClientDb(), COLLECTIONS.shipments),
      where("userId", "==", user.uid),
      orderBy("updatedAt", "desc"),
    );
    return onSnapshot(q, (snap) =>
      setShipments(snap.docs.map((d) => d.data() as ShipmentRecord)),
    );
  }, [user]);

  return (
    <div>
      <PageTitle
        title="Tracking"
        subtitle="Logged-in tracking for Beta. Public tracking page is P1 / not in Beta."
      />
      <Alert>Public tracking is intentionally not available in Beta.</Alert>
      <Panel className="mt-4">
        <ul className="space-y-3 text-sm">
          {shipments.map((s) => (
            <li key={s.id} className="border-b border-[color:var(--line)] pb-3">
              <p className="font-medium">{s.status}</p>
              <p className="text-[color:var(--muted)]">
                {s.courierName || "Courier pending"} · {s.trackingNumber || "Tracking pending"}
              </p>
              <p className="text-[color:var(--muted)]">
                To {s.destination.city}, {s.destination.state} {s.destination.postal}, AU
              </p>
            </li>
          ))}
          {shipments.length === 0 ? (
            <li className="text-[color:var(--muted)]">No outbound shipments yet.</li>
          ) : null}
        </ul>
      </Panel>
    </div>
  );
}

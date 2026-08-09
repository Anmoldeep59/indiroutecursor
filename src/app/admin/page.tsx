"use client";

import { useEffect, useState } from "react";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { PageTitle, Panel } from "@/components/ui/ui";
import { getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";

async function countWhere(field: string, value: string) {
  const q = query(
    collection(getClientDb(), COLLECTIONS.packages),
    where(field, "==", value),
  );
  const snap = await getCountFromServer(q);
  return snap.data().count;
}

export default function AdminHomePage() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!isFirebaseClientConfigured()) return;
    void (async () => {
      try {
        const [unidentified, packing, awaiting, ready, exceptions] = await Promise.all([
          countWhere("status", "Unidentified"),
          countWhere("status", "Consolidation Requested"),
          countWhere("status", "Awaiting Payment"),
          countWhere("status", "Ready to Ship"),
          countWhere("status", "Exception"),
        ]);
        setCounts({ unidentified, packing, awaiting, ready, exceptions });
      } catch {
        setCounts({});
      }
    })();
  }, []);

  const cards = [
    ["Unidentified", counts.unidentified],
    ["Pack queue", counts.packing],
    ["Awaiting payment", counts.awaiting],
    ["Ready to ship", counts.ready],
    ["Exceptions", counts.exceptions],
  ] as const;

  return (
    <div>
      <PageTitle title="Ops dashboard" subtitle="Beta corridors: India → Australia" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value]) => (
          <Panel key={label} className="!border-zinc-700 !bg-zinc-950">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value ?? "—"}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}

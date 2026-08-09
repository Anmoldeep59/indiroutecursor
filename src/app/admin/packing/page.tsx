"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy, limit } from "firebase/firestore";
import { PageTitle, Panel } from "@/components/ui/ui";
import { getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";

export default function Page() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    if (!isFirebaseClientConfigured()) return;
    const q = query(
      collection(getClientDb(), COLLECTIONS.packages),
      where("status", "==", "Consolidation Requested"),
      orderBy("updatedAt", "desc"),
      limit(100),
    );
    return onSnapshot(q, (snap) => setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
  }, []);
  return (
    <div>
      <PageTitle title="Packing / consolidation queue" />
      <Panel className="!border-zinc-700 !bg-zinc-950">
        <ul className="space-y-2 text-sm">
          {rows.map((r) => (
            <li key={r.id} className="border-b border-zinc-800 pb-2">
              <span className="font-medium">{r.barcode || r.number || r.email || r.id}</span>
              {" · "}
              {r.status || r.role || r.subject || ""}
              {r.indId ? ` · ${r.indId}` : ""}
              {r.trackingNumber ? ` · ${r.trackingNumber}` : ""}
            </li>
          ))}
          {rows.length === 0 ? <li className="text-zinc-500">No records.</li> : null}
        </ul>
      </Panel>
    </div>
  );
}

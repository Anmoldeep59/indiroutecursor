"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { PageTitle, Panel, Input } from "@/components/ui/ui";
import { getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";

export default function CustomersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [qtext, setQtext] = useState("");
  useEffect(() => {
    if (!isFirebaseClientConfigured()) return;
    const q = query(collection(getClientDb(), COLLECTIONS.users), orderBy("createdAt", "desc"), limit(200));
    return onSnapshot(q, (snap) => setRows(snap.docs.map((d) => d.data())));
  }, []);
  const filtered = rows.filter((r) => {
    const hay = `${r.email} ${r.indId} ${r.displayName}`.toLowerCase();
    return hay.includes(qtext.toLowerCase());
  });
  return (
    <div>
      <PageTitle title="Customers" subtitle="Search by email or IND"  variant="dark" />
      <Input className="mb-4 max-w-md !bg-zinc-950 !text-zinc-100 !border-zinc-700" placeholder="Search" value={qtext} onChange={(e) => setQtext(e.target.value)} />
      <Panel className="!border-zinc-700 !bg-zinc-950">
        <ul className="space-y-2 text-sm">
          {filtered.map((r) => (
            <li key={r.uid} className="border-b border-zinc-800 pb-2">
              {r.displayName} · {r.email} · {r.indId || "no IND"} · verified={String(r.emailVerified)}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

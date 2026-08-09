"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthProvider";
import { useApi } from "@/lib/hooks/useApi";
import { Alert, Button, PageTitle, Panel } from "@/components/ui/ui";
import { getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { PackageRecord } from "@/lib/types";

export default function ConsolidatePage() {
  const { user } = useAuth();
  const { api } = useApi();
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (!isFirebaseClientConfigured() || !user) return;
    const q = query(
      collection(getClientDb(), COLLECTIONS.packages),
      where("userId", "==", user.uid),
      where("status", "==", "Stored"),
    );
    return onSnapshot(q, (snap) =>
      setPackages(
        snap.docs
          .map((d) => d.data() as PackageRecord)
          .filter((p) => !p.consolidatedIntoId),
      ),
    );
  }, [user]);
  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  async function submit() {
    setErr(null); setMsg(null);
    try {
      await api("/api/consolidations", { method: "POST", json: { packageIds: selected } });
      setMsg("Consolidation requested.");
      setSelected([]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }
  return (
    <div>
      <PageTitle title="Consolidation" subtitle="Select 2+ Stored packages. Staff will scan-verify each barcode." />
      <Panel>
        <ul className="space-y-2">
          {packages.map((pkg) => (
            <li key={pkg.id} className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={selected.includes(pkg.id)} onChange={() => toggle(pkg.id)} />
              <span>{pkg.barcode} · {pkg.weightKg} kg</span>
            </li>
          ))}
        </ul>
        <Button className="mt-4" disabled={selected.length < 2} onClick={submit}>Request consolidation</Button>
        {msg ? <div className="mt-3"><Alert tone="success">{msg}</Alert></div> : null}
        {err ? <div className="mt-3"><Alert tone="danger">{err}</Alert></div> : null}
      </Panel>
    </div>
  );
}

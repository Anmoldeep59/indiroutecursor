"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { useApi } from "@/lib/hooks/useApi";
import { Alert, Button, Input, Label, PageTitle, Panel } from "@/components/ui/ui";
import { getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";

export default function ShippingQueuePage() {
  const { api } = useApi();
  const [ready, setReady] = useState<any[]>([]);
  const [shipped, setShipped] = useState<any[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (!isFirebaseClientConfigured()) return;
    const q1 = query(collection(getClientDb(), COLLECTIONS.shipments), where("status", "==", "Ready to Ship"), orderBy("updatedAt", "desc"));
    const q2 = query(collection(getClientDb(), COLLECTIONS.shipments), where("status", "in", ["Shipped", "In Transit", "Customs", "Out for Delivery"]), orderBy("updatedAt", "desc"));
    const u1 = onSnapshot(q1, (s) => setReady(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(q2, (s) => setShipped(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => { u1(); u2(); };
  }, []);

  async function dispatch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null); setErr(null);
    const form = new FormData(e.currentTarget);
    try {
      await api("/api/admin/shipments/dispatch", {
        method: "POST",
        json: {
          shipmentId: String(form.get("shipmentId")),
          courierName: String(form.get("courierName")),
          trackingNumber: String(form.get("trackingNumber")),
          dispatchPhotoPath: String(form.get("dispatchPhotoPath") || ""),
        },
      });
      setMsg("Marked shipped.");
      e.currentTarget.reset();
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Failed");
    }
  }

  async function milestone(shipmentId: string, status: string) {
    setMsg(null); setErr(null);
    try {
      await api("/api/admin/shipments/dispatch", {
        method: "PATCH",
        json: { shipmentId, status },
      });
      setMsg(`Updated to ${status}`);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Failed");
    }
  }

  return (
    <div>
      <PageTitle title="Shipping queue" subtitle="Manual courier booking + tracking entry. No courier APIs in Beta." />
      <Panel className="!border-zinc-700 !bg-zinc-950">
        <h2 className="font-medium">Ready to ship</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {ready.map((s) => <li key={s.id}>{s.id.slice(0,8)} · packages {s.packageIds?.length}</li>)}
        </ul>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={dispatch}>
          <div className="md:col-span-2"><Label>Shipment ID</Label><Input name="shipmentId" required /></div>
          <div><Label>Courier</Label><Input name="courierName" required /></div>
          <div><Label>Tracking number</Label><Input name="trackingNumber" required /></div>
          <div className="md:col-span-2"><Label>Dispatch photo path</Label><Input name="dispatchPhotoPath" /></div>
          <div className="md:col-span-2"><Button type="submit">Dispatch → Shipped</Button></div>
        </form>
      </Panel>
      <Panel className="mt-4 !border-zinc-700 !bg-zinc-950">
        <h2 className="font-medium">In progress</h2>
        <ul className="mt-2 space-y-3 text-sm">
          {shipped.map((s) => (
            <li key={s.id} className="border-b border-zinc-800 pb-3">
              <p>{s.status} · {s.courierName} · {s.trackingNumber}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["In Transit","Customs","Out for Delivery","Delivered","Exception","Returned"].map((st) => (
                  <Button key={st} type="button" variant="secondary" onClick={() => milestone(s.id, st)}>{st}</Button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Panel>
      {msg ? <div className="mt-3"><Alert tone="success">{msg}</Alert></div> : null}
      {err ? <div className="mt-3"><Alert tone="danger">{err}</Alert></div> : null}
    </div>
  );
}

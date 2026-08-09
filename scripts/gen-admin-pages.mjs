import fs from "fs";
import path from "path";

const root = process.cwd();
function w(rel, content) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
  console.log("wrote", rel);
}

const listPage = (title, collection, statusFilter) => `"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query${statusFilter ? ', where' : ''}, orderBy, limit } from "firebase/firestore";
import { PageTitle, Panel } from "@/components/ui/ui";
import { getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";

export default function Page() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    if (!isFirebaseClientConfigured()) return;
    const q = query(
      collection(getClientDb(), COLLECTIONS.${collection}),
      ${statusFilter ? `where("status", "==", "${statusFilter}"),` : ""}
      orderBy("updatedAt", "desc"),
      limit(100),
    );
    return onSnapshot(q, (snap) => setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
  }, []);
  return (
    <div>
      <PageTitle title="${title}" />
      <Panel className="!border-zinc-700 !bg-zinc-950">
        <ul className="space-y-2 text-sm">
          {rows.map((r) => (
            <li key={r.id} className="border-b border-zinc-800 pb-2">
              <span className="font-medium">{r.barcode || r.number || r.email || r.id}</span>
              {" · "}
              {r.status || r.role || r.subject || ""}
              {r.indId ? \` · \${r.indId}\` : ""}
              {r.trackingNumber ? \` · \${r.trackingNumber}\` : ""}
            </li>
          ))}
          {rows.length === 0 ? <li className="text-zinc-500">No records.</li> : null}
        </ul>
      </Panel>
    </div>
  );
}
`;

w("src/app/admin/packages/page.tsx", listPage("Packages", "packages", null));
w("src/app/admin/unidentified/page.tsx", listPage("Unidentified", "packages", "Unidentified"));
w("src/app/admin/packing/page.tsx", listPage("Packing / consolidation queue", "packages", "Consolidation Requested"));
w("src/app/admin/payments/page.tsx", listPage("Payments", "payments", null));
w("src/app/admin/invoices/page.tsx", listPage("Invoices", "invoices", null));
w("src/app/admin/support/page.tsx", listPage("Support tickets", "supportTickets", null));
w("src/app/admin/audit/page.tsx", listPage("Audit logs", "auditLogs", null));

w(
  "src/app/admin/customers/page.tsx",
  `"use client";
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
    const hay = \`\${r.email} \${r.indId} \${r.displayName}\`.toLowerCase();
    return hay.includes(qtext.toLowerCase());
  });
  return (
    <div>
      <PageTitle title="Customers" subtitle="Search by email or IND" />
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
`,
);

w(
  "src/app/admin/shipping/page.tsx",
  `"use client";
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
      setMsg(\`Updated to \${status}\`);
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
`,
);

console.log("admin pages done");

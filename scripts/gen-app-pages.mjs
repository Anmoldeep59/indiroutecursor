import fs from "fs";
import path from "path";

const root = process.cwd();
function w(rel, content) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
  console.log("wrote", rel);
}

w(
  "src/app/dashboard/packages/page.tsx",
  `"use client";
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
                <Link href={\`/dashboard/packages/\${pkg.id}\`} className="font-medium">{pkg.barcode}</Link>
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
`,
);

w(
  "src/app/dashboard/packages/[id]/page.tsx",
  `"use client";
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
`,
);

w(
  "src/app/dashboard/consolidate/page.tsx",
  `"use client";
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
`,
);

w(
  "src/app/dashboard/security/page.tsx",
  `"use client";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Alert, Button, Input, Label, PageTitle, Panel } from "@/components/ui/ui";

export default function SecurityPage() {
  const { changePassword } = useAuth();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null); setErr(null);
    const form = new FormData(e.currentTarget);
    try {
      await changePassword(String(form.get("current")), String(form.get("next")));
      setMsg("Password updated.");
      e.currentTarget.reset();
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Failed");
    }
  }
  return (
    <div>
      <PageTitle title="Security" subtitle="Password change requires re-authentication. Email change is deferred in Beta unless founder enables it." />
      <Panel>
        <form className="max-w-md space-y-3" onSubmit={onSubmit}>
          <div><Label>Current password</Label><Input name="current" type="password" required /></div>
          <div><Label>New password</Label><Input name="next" type="password" minLength={8} required /></div>
          <Button type="submit">Update password</Button>
        </form>
        {msg ? <div className="mt-3"><Alert tone="success">{msg}</Alert></div> : null}
        {err ? <div className="mt-3"><Alert tone="danger">{err}</Alert></div> : null}
      </Panel>
    </div>
  );
}
`,
);

console.log("batch1 done");

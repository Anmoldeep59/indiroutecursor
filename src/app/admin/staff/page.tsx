"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthProvider";
import { Alert, PageTitle, Panel } from "@/components/ui/ui";
import { getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { StaffProfile } from "@/lib/types";

export default function StaffPage() {
  const { staff } = useAuth();
  const [rows, setRows] = useState<StaffProfile[]>([]);

  useEffect(() => {
    if (!isFirebaseClientConfigured()) return;
    return onSnapshot(collection(getClientDb(), COLLECTIONS.staff), (snap) =>
      setRows(snap.docs.map((d) => d.data() as StaffProfile)),
    );
  }, []);

  return (
    <div>
      <PageTitle
        title="Staff accounts"
        subtitle="Beta roles only: Warehouse Staff and Super Admin. Bootstrap staff docs in Firestore manually."
      />
      {staff?.role !== "super_admin" ? (
        <Alert tone="warn">Only Super Admin can manage staff roles.</Alert>
      ) : (
        <Alert tone="info">
          Create Firebase Auth users, then add documents in <code>staff/&#123;uid&#125;</code> with
          role warehouse_staff or super_admin and active true. Never share passwords.
        </Alert>
      )}
      <Panel className="mt-4 !border-zinc-700 !bg-zinc-950">
        <ul className="space-y-2 text-sm">
          {rows.map((r) => (
            <li key={r.uid}>
              {r.email} · {r.role} · active={String(r.active)}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

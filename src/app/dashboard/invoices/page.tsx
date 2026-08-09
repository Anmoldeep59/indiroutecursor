"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageTitle, Panel } from "@/components/ui/ui";
import { getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { InvoiceRecord } from "@/lib/types";
import { formatAudCents } from "@/lib/format";

export default function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  useEffect(() => {
    if (!isFirebaseClientConfigured() || !user) return;
    const q = query(
      collection(getClientDb(), COLLECTIONS.invoices),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(q, (snap) =>
      setInvoices(snap.docs.map((d) => d.data() as InvoiceRecord)),
    );
  }, [user]);

  return (
    <div>
      <PageTitle title="Invoices" />
      <Panel>
        <ul className="space-y-3 text-sm">
          {invoices.map((inv) => (
            <li key={inv.id} className="border-b border-[color:var(--line)] pb-3">
              <p className="font-medium">
                {inv.number} · {formatAudCents(inv.totalAudCents)}
              </p>
              <ul className="mt-1 text-[color:var(--muted)]">
                {inv.lineItems.map((li) => (
                  <li key={li.label}>
                    {li.label}: {formatAudCents(li.amountAudCents)}
                  </li>
                ))}
              </ul>
            </li>
          ))}
          {invoices.length === 0 ? (
            <li className="text-[color:var(--muted)]">No invoices yet.</li>
          ) : null}
        </ul>
      </Panel>
    </div>
  );
}

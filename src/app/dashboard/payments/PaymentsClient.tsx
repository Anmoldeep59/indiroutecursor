"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthProvider";
import { Alert, PageTitle, Panel } from "@/components/ui/ui";
import { getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { PaymentRecord } from "@/lib/types";
import { formatAudCents } from "@/lib/format";

export function PaymentsClient() {
  const { user } = useAuth();
  const params = useSearchParams();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  useEffect(() => {
    if (!isFirebaseClientConfigured() || !user) return;
    const q = query(
      collection(getClientDb(), COLLECTIONS.payments),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(q, (snap) =>
      setPayments(snap.docs.map((d) => d.data() as PaymentRecord)),
    );
  }, [user]);

  return (
    <div>
      <PageTitle
        title="Payments"
        subtitle="Direct Stripe charges only. There is no wallet, balance, or credit ledger."
      />
      {params.get("checkout") === "success" ? (
        <Alert tone="info">
          Checkout completed in browser. Final paid status is confirmed by Stripe webhook —
          refresh shortly if status still shows pending.
        </Alert>
      ) : null}
      <Panel className="mt-4">
        <ul className="space-y-3 text-sm">
          {payments.map((p) => (
            <li key={p.id} className="border-b border-[color:var(--line)] pb-3">
              <p className="font-medium">
                {p.status} · {formatAudCents(p.amountAudCents)} AUD
              </p>
              <p className="text-[color:var(--muted)]">
                {p.purpose} · {new Date(p.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
          {payments.length === 0 ? (
            <li className="text-[color:var(--muted)]">No payments yet.</li>
          ) : null}
        </ul>
      </Panel>
    </div>
  );
}

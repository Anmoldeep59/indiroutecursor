"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageTitle, Panel } from "@/components/ui/ui";
import { getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { ShippingQuote } from "@/lib/types";
import { formatAudCents } from "@/lib/format";
import Link from "next/link";

export default function QuotesPage() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<ShippingQuote[]>([]);
  useEffect(() => {
    if (!isFirebaseClientConfigured() || !user) return;
    const q = query(
      collection(getClientDb(), COLLECTIONS.quotes),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(q, (snap) =>
      setQuotes(snap.docs.map((d) => d.data() as ShippingQuote)),
    );
  }, [user]);

  return (
    <div>
      <PageTitle title="Shipping quotes" subtitle="Valid for 48 hours. Invalidated after consolidation." />
      <Panel>
        <ul className="space-y-3 text-sm">
          {quotes.map((q) => (
            <li key={q.id} className="border-b border-[color:var(--line)] pb-3">
              <p className="font-medium">
                {q.status} · {q.chargeableWeightKg.toFixed(2)} kg
              </p>
              <p className="text-[color:var(--muted)]">
                Expires {new Date(q.expiresAt).toLocaleString()} · From{" "}
                {formatAudCents(Math.min(...q.options.map((o) => o.totalAudCents)))}
              </p>
            </li>
          ))}
          {quotes.length === 0 ? (
            <li className="text-[color:var(--muted)]">
              No quotes yet. <Link href="/dashboard/ship">Create one</Link>
            </li>
          ) : null}
        </ul>
      </Panel>
    </div>
  );
}

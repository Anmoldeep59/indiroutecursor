"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthProvider";
import { Alert, Button, Input, Label, PageTitle, Panel } from "@/components/ui/ui";
import { getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { DeliveryAddress } from "@/lib/types";

export default function AddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<(DeliveryAddress & { id: string })[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseClientConfigured() || !user) return;
    const q = query(
      collection(getClientDb(), COLLECTIONS.deliveryAddresses),
      where("userId", "==", user.uid),
    );
    return onSnapshot(q, (snap) =>
      setAddresses(
        snap.docs.map((d) => ({ ...(d.data() as DeliveryAddress), id: d.id })),
      ),
    );
  }, [user]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || !isFirebaseClientConfigured()) return;
    setErr(null);
    const form = new FormData(e.currentTarget);
    try {
      await addDoc(collection(getClientDb(), COLLECTIONS.deliveryAddresses), {
        userId: user.uid,
        label: String(form.get("label")),
        name: String(form.get("name")),
        line1: String(form.get("line1")),
        line2: String(form.get("line2") || ""),
        city: String(form.get("city")),
        state: String(form.get("state")),
        postal: String(form.get("postal")),
        country: "AU",
        phone: String(form.get("phone") || ""),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _ts: serverTimestamp(),
      });
      e.currentTarget.reset();
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Could not save address");
    }
  }

  return (
    <div>
      <PageTitle
        title="Saved delivery addresses"
        subtitle="Australia destinations only in Beta."
      />
      <Panel>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
          <div><Label>Label</Label><Input name="label" placeholder="Home" required /></div>
          <div><Label>Recipient</Label><Input name="name" required /></div>
          <div className="md:col-span-2"><Label>Line 1</Label><Input name="line1" required /></div>
          <div className="md:col-span-2"><Label>Line 2</Label><Input name="line2" /></div>
          <div><Label>City</Label><Input name="city" required /></div>
          <div><Label>State</Label><Input name="state" required /></div>
          <div><Label>Postal</Label><Input name="postal" required /></div>
          <div><Label>Phone</Label><Input name="phone" /></div>
          <div className="md:col-span-2"><Button type="submit">Save AU address</Button></div>
        </form>
        {err ? <div className="mt-3"><Alert tone="danger">{err}</Alert></div> : null}
      </Panel>
      <Panel className="mt-4">
        <ul className="space-y-3 text-sm">
          {addresses.map((a) => (
            <li key={a.id} className="border-b border-[color:var(--line)] pb-3">
              <p className="font-medium">{a.label} · {a.name}</p>
              <p className="text-[color:var(--muted)]">
                {a.line1}, {a.city} {a.state} {a.postal}, AU
              </p>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

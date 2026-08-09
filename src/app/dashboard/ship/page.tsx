"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthProvider";
import { useApi } from "@/lib/hooks/useApi";
import { Alert, Button, Input, Label, PageTitle, Panel } from "@/components/ui/ui";
import { getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { PackageRecord, ShippingQuote } from "@/lib/types";
import { formatAudCents } from "@/lib/format";

export default function ShipPage() {
  const { user } = useAuth();
  const { api } = useApi();
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [packageId, setPackageId] = useState("");
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [serviceId, setServiceId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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

  async function createQuote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    try {
      const data = await api<{ quote: ShippingQuote }>("/api/quotes", {
        method: "POST",
        json: {
          packageIds: [packageId],
          destination: {
            name: String(form.get("name")),
            line1: String(form.get("line1")),
            line2: String(form.get("line2") || ""),
            city: String(form.get("city")),
            state: String(form.get("state")),
            postal: String(form.get("postal")),
            country: "AU",
            phone: String(form.get("phone") || ""),
          },
        },
      });
      setQuote(data.quote);
      setServiceId(data.quote.options[0]?.serviceId ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Quote failed");
    } finally {
      setPending(false);
    }
  }

  async function pay() {
    if (!quote || !serviceId) return;
    setError(null);
    setPending(true);
    try {
      const formCustoms = {
        description: "Personal effects / retail goods",
        quantity: 1,
        valueAudCents: 5000,
        originCountry: "IN",
      };
      const data = await api<{ url: string }>("/api/checkout", {
        method: "POST",
        json: {
          quoteId: quote.id,
          serviceId,
          customsItems: [formCustoms],
        },
      });
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <PageTitle
        title="Ship package"
        subtitle="Australia only. Payable quotes use warehouse measurements and expire in 48 hours. No wallet."
      />
      <Alert tone="info">
        Australian duties and taxes are your responsibility and are not collected at
        checkout.
      </Alert>
      <Panel className="mt-4">
        <form className="grid gap-3 md:grid-cols-2" onSubmit={createQuote}>
          <div className="md:col-span-2">
            <Label>Package</Label>
            <select
              className="w-full rounded-md border border-[color:var(--line)] px-3 py-2 text-sm"
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
              required
            >
              <option value="">Select Stored package</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.barcode} · {p.weightKg} kg
                </option>
              ))}
            </select>
          </div>
          <div><Label>Recipient name</Label><Input name="name" required /></div>
          <div><Label>Phone</Label><Input name="phone" /></div>
          <div className="md:col-span-2"><Label>Address line 1</Label><Input name="line1" required /></div>
          <div className="md:col-span-2"><Label>Address line 2</Label><Input name="line2" /></div>
          <div><Label>City</Label><Input name="city" required /></div>
          <div><Label>State</Label><Input name="state" required /></div>
          <div><Label>Postal code</Label><Input name="postal" required /></div>
          <div>
            <Label>Country</Label>
            <Input name="country" value="Australia (AU)" disabled />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={pending || !packageId}>
              Get AUD quote
            </Button>
          </div>
        </form>
      </Panel>

      {quote ? (
        <Panel className="mt-4 space-y-3">
          <p className="text-sm">
            Chargeable weight: {quote.chargeableWeightKg.toFixed(2)} kg · Expires{" "}
            {new Date(quote.expiresAt).toLocaleString()}
          </p>
          {quote.options.map((o) => (
            <label key={o.serviceId} className="flex items-start gap-3 border-t border-[color:var(--line)] pt-3 text-sm">
              <input
                type="radio"
                name="service"
                checked={serviceId === o.serviceId}
                onChange={() => setServiceId(o.serviceId)}
              />
              <span>
                <strong>{o.serviceName}</strong> ({o.courierName}) · ETA {o.etaDaysMin}–
                {o.etaDaysMax} days
                <br />
                Shipping {formatAudCents(o.shippingAudCents)} + Handling{" "}
                {formatAudCents(o.handlingAudCents)}
                {o.storageAudCents > 0
                  ? ` + Storage ${formatAudCents(o.storageAudCents)}`
                  : ""}{" "}
                = <strong>{formatAudCents(o.totalAudCents)}</strong>
              </span>
            </label>
          ))}
          <Button onClick={pay} disabled={pending || !serviceId}>
            Pay with Stripe
          </Button>
          <p className="text-xs text-[color:var(--muted)]">
            Payment success is confirmed by Stripe webhook — not by the browser redirect alone.
          </p>
        </Panel>
      ) : null}
      {error ? (
        <div className="mt-4">
          <Alert tone="danger">{error}</Alert>
        </div>
      ) : null}
    </div>
  );
}

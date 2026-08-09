"use client";

import { useState } from "react";
import { Alert, Button, Input, Label, PageTitle, Panel } from "@/components/ui/ui";
import { formatAudCents } from "@/lib/format";

type CalcResult = {
  payable: boolean;
  disclaimer: string;
  chargeableWeightKg: number | null;
  actualWeightKg: number;
  volumetricWeightKg: number | null;
  options: {
    serviceName: string;
    courierName: string;
    shippingAudCents: number | null;
    etaDaysMin: number;
    etaDaysMax: number;
  }[];
};

export default function ShippingCalculatorPage() {
  const [result, setResult] = useState<CalcResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/calculator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        country: form.get("country"),
        postal: form.get("postal"),
        weightKg: Number(form.get("weightKg")),
        lengthCm: Number(form.get("lengthCm")),
        widthCm: Number(form.get("widthCm")),
        heightCm: Number(form.get("heightCm")),
        packageType: form.get("packageType"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Calculation failed");
      return;
    }
    setResult(data);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      <PageTitle
        title="Shipping calculator"
        subtitle="Estimate only. Final payable quotes use warehouse-recorded weight and dimensions."
      />
      <Panel>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          <div className="sm:col-span-2">
            <Label>Destination country</Label>
            <select
              name="country"
              className="w-full rounded-md border border-[color:var(--line)] px-3 py-2 text-sm"
              defaultValue="AU"
            >
              <option value="AU">Australia</option>
              <option value="OTHER">Other (not available in Beta)</option>
            </select>
          </div>
          <div>
            <Label>Postal code</Label>
            <Input name="postal" placeholder="e.g. 2000" />
          </div>
          <div>
            <Label>Package type</Label>
            <select
              name="packageType"
              className="w-full rounded-md border border-[color:var(--line)] px-3 py-2 text-sm"
              defaultValue="parcel"
            >
              <option value="parcel">Parcel</option>
              <option value="document">Document</option>
            </select>
          </div>
          <div>
            <Label>Weight (kg)</Label>
            <Input name="weightKg" type="number" step="0.01" min="0.01" required />
          </div>
          <div>
            <Label>Length (cm)</Label>
            <Input name="lengthCm" type="number" min="1" required />
          </div>
          <div>
            <Label>Width (cm)</Label>
            <Input name="widthCm" type="number" min="1" required />
          </div>
          <div>
            <Label>Height (cm)</Label>
            <Input name="heightCm" type="number" min="1" required />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit">Estimate</Button>
          </div>
        </form>
      </Panel>
      {error ? <div className="mt-4"><Alert tone="danger">{error}</Alert></div> : null}
      {result ? (
        <Panel className="mt-4 space-y-3">
          <Alert tone="warn">{result.disclaimer}</Alert>
          <p className="text-sm">
            Chargeable weight:{" "}
            {result.chargeableWeightKg != null
              ? `${result.chargeableWeightKg.toFixed(2)} kg`
              : "Unavailable until volumetric divisor is configured"}
          </p>
          {result.options?.length ? (
            <ul className="space-y-2 text-sm">
              {result.options.map((o) => (
                <li key={o.serviceName} className="border-t border-[color:var(--line)] pt-2">
                  <strong>{o.serviceName}</strong> ({o.courierName}) · ETA {o.etaDaysMin}–
                  {o.etaDaysMax} days ·{" "}
                  {o.shippingAudCents != null
                    ? formatAudCents(o.shippingAudCents)
                    : "Rate break missing"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[color:var(--muted)]">
              No rate cards loaded yet. Estimates show chargeable weight only.
            </p>
          )}
          <p className="text-xs text-[color:var(--muted)]">
            This estimate cannot be paid. Create a quote from your dashboard after we store
            your package.
          </p>
        </Panel>
      ) : null}
    </div>
  );
}

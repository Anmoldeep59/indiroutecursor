"use client";

import { useState } from "react";
import Link from "next/link";
import { TrustBadges } from "@/components/brand/TrustBadges";
import { TricolorBar } from "@/components/brand/TricolorBar";
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
  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const [dimUnit, setDimUnit] = useState<"cm" | "in">("cm");
  const [showDims, setShowDims] = useState(true);
  const [weight, setWeight] = useState(0.5);
  const [length, setLength] = useState(10);
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(10);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function step(value: number, delta: number, min = 0.1) {
    return Math.max(min, Math.round((value + delta) * 100) / 100);
  }

  async function calculate() {
    setPending(true);
    setError(null);
    const weightKg = unit === "kg" ? weight : weight * 0.453592;
    const toCm = (v: number) => (dimUnit === "cm" ? v : v * 2.54);
    try {
      const res = await fetch("/api/calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: "AU",
          weightKg,
          lengthCm: showDims ? toCm(length) : 10,
          widthCm: showDims ? toCm(width) : 10,
          heightCm: showDims ? toCm(height) : 10,
          packageType: "parcel",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Calculation failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="bg-[color:var(--wash)]">
      <TricolorBar />
      <div className="mx-auto max-w-[1140px] px-4 pt-8 md:px-5">
        <TrustBadges dense />
      </div>
      <div className="mx-auto grid max-w-[1140px] gap-6 px-4 py-8 md:grid-cols-[1fr_320px] md:px-5">
        <div className="sp-card p-6 md:p-8">
          <h1 className="text-2xl font-bold text-[#7c3aed] md:text-3xl">
            Calculate Your International Shipping Cost
          </h1>
          <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
            Cheapest international shipping rates from India to Australia.
          </p>

          <div className="mt-8 space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[color:var(--navy)]">
                Where do you want to send your package to?
              </label>
              <select
                className="w-full rounded-md border border-[color:var(--line)] px-3 py-3 text-sm"
                defaultValue="AU"
              >
                <option value="AU">Australia</option>
                <option value="OTHER" disabled>
                  Other countries (not in Beta)
                </option>
              </select>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-sm font-semibold text-[color:var(--navy)]">
                  Package Weight *
                </label>
                <div className="inline-flex overflow-hidden rounded-full border border-[color:var(--line)] text-xs font-bold">
                  <button
                    type="button"
                    className={`px-3 py-1 ${unit === "kg" ? "bg-[color:var(--blue)] text-white" : "bg-white"}`}
                    onClick={() => setUnit("kg")}
                  >
                    KG
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 ${unit === "lb" ? "bg-[color:var(--blue)] text-white" : "bg-white"}`}
                    onClick={() => setUnit("lb")}
                  >
                    LB
                  </button>
                </div>
              </div>
              <Stepper value={weight} onChange={setWeight} stepFn={step} />
            </div>

            <label className="flex items-center gap-2 text-sm text-[color:var(--navy)]">
              <input
                type="checkbox"
                checked={showDims}
                onChange={(e) => setShowDims(e.target.checked)}
              />
              Add Volumetric Dimensions (Optional)
            </label>

            {showDims ? (
              <div>
                <div className="mb-3 inline-flex overflow-hidden rounded-full border border-[color:var(--line)] text-xs font-bold">
                  <button
                    type="button"
                    className={`px-3 py-1 ${dimUnit === "cm" ? "bg-[color:var(--blue)] text-white" : "bg-white"}`}
                    onClick={() => setDimUnit("cm")}
                  >
                    cm
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 ${dimUnit === "in" ? "bg-[color:var(--blue)] text-white" : "bg-white"}`}
                    onClick={() => setDimUnit("in")}
                  >
                    in
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="mb-1 text-xs font-semibold">Length</p>
                    <Stepper value={length} onChange={setLength} stepFn={step} />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold">Width</p>
                    <Stepper value={width} onChange={setWidth} stepFn={step} />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold">Height</p>
                    <Stepper value={height} onChange={setHeight} stepFn={step} />
                  </div>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={calculate}
              disabled={pending}
              className="sp-btn-orange w-full sm:w-auto"
            >
              {pending ? "Calculating…" : "Check Prices"}
            </button>

            {error ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            ) : null}

            {result ? (
              <div className="rounded-lg border border-[color:var(--line)] bg-[color:var(--wash)] p-4 text-sm">
                <p className="font-semibold text-amber-800">{result.disclaimer}</p>
                <p className="mt-2">
                  Chargeable weight:{" "}
                  {result.chargeableWeightKg != null
                    ? `${result.chargeableWeightKg.toFixed(2)} kg`
                    : "Configure volumetric divisor first"}
                </p>
                <ul className="mt-3 space-y-2">
                  {result.options?.map((o) => (
                    <li key={o.serviceName}>
                      {o.serviceName} ({o.courierName}) · {o.etaDaysMin}-{o.etaDaysMax}d ·{" "}
                      {o.shippingAudCents != null
                        ? formatAudCents(o.shippingAudCents)
                        : "Rate missing"}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-[color:var(--muted)]">
                  This estimate cannot be paid. Create a quote from your dashboard after we
                  store your package.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="space-y-4">
          <Link
            href="/pricing"
            className="block rounded-xl bg-[color:var(--chakra)] px-4 py-3 text-center text-sm font-bold text-white"
          >
            Seller Shipping Rates
          </Link>
          <div className="flex gap-4 rounded-lg bg-[#f5efe6] px-4 py-3 text-sm">
            <Link href="/countries" className="font-semibold text-[color:var(--ink)] hover:underline">
              Country Guide
            </Link>
            <Link href="/pricing" className="font-semibold text-[color:var(--ink)] hover:underline">
              Offers Available
            </Link>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#ec4899] p-5 text-white shadow-md">
            <span className="inline-block rounded bg-[color:var(--navy)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
              First Shipment
            </span>
            <p className="mt-3 text-lg font-bold">First International Shipment?</p>
            <p className="mt-1 text-sm text-white/90">
              Transparent AUD pricing after warehouse weigh-in — no fake promo wallets.
            </p>
            <Link
              href="/signup"
              className="mt-4 inline-flex rounded-full border border-dashed border-white/60 bg-white/15 px-4 py-1.5 text-xs font-bold"
            >
              Sign up free
            </Link>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-[#0d9488] to-[#38bdf8] p-5 text-white shadow-md">
            <span className="inline-block rounded bg-[color:var(--navy)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
              New User
            </span>
            <p className="mt-3 text-lg font-bold">Need Help Buying from India?</p>
            <p className="mt-1 text-sm text-white/90">
              Assisted Purchase launches after Beta. Get your locker address now.
            </p>
            <Link
              href="/assisted-purchase"
              className="mt-4 inline-flex rounded-full border border-dashed border-white/60 bg-white/15 px-4 py-1.5 text-xs font-bold"
            >
              Learn more
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stepper({
  value,
  onChange,
  stepFn,
}: {
  value: number;
  onChange: (v: number) => void;
  stepFn: (v: number, d: number) => number;
}) {
  return (
    <div className="flex items-center overflow-hidden rounded-md border border-[color:var(--line)] bg-white">
      <button
        type="button"
        className="px-4 py-3 text-lg font-bold text-[color:var(--navy)] hover:bg-[color:var(--wash)]"
        onClick={() => onChange(stepFn(value, -0.1))}
      >
        −
      </button>
      <input
        className="w-full border-x border-[color:var(--line)] py-3 text-center text-sm outline-none"
        type="number"
        step="0.1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
      <button
        type="button"
        className="px-4 py-3 text-lg font-bold text-[color:var(--navy)] hover:bg-[color:var(--wash)]"
        onClick={() => onChange(stepFn(value, 0.1))}
      >
        +
      </button>
    </div>
  );
}

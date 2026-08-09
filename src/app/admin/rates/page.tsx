"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/lib/hooks/useApi";
import { useAuth } from "@/components/auth/AuthProvider";
import { Alert, Button, Input, Label, PageTitle, Panel } from "@/components/ui/ui";
import { formatAudCents } from "@/lib/format";
import type { RateCard } from "@/lib/types";

export default function RatesPage() {
  const { api } = useApi();
  const { staff } = useAuth();
  const [rates, setRates] = useState<RateCard[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const data = await api<{ rates: RateCard[] }>("/api/admin/rates");
    setRates(data.rates);
  }

  useEffect(() => {
    void load().catch(() => setRates([]));
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (staff?.role !== "super_admin") {
      setErr("Super Admin only");
      return;
    }
    setMsg(null);
    setErr(null);
    const form = new FormData(e.currentTarget);
    const breaksRaw = String(form.get("breaks"));
    // format: 0.5:2500,1:4000 (kg:cents)
    const breaks = breaksRaw.split(",").map((part) => {
      const [kg, cents] = part.trim().split(":");
      return { upToKg: Number(kg), priceAudCents: Number(cents) };
    });
    try {
      await api("/api/admin/rates", {
        method: "POST",
        json: {
          serviceId: String(form.get("serviceId")),
          serviceName: String(form.get("serviceName")),
          courierName: String(form.get("courierName")),
          etaDaysMin: Number(form.get("etaDaysMin")),
          etaDaysMax: Number(form.get("etaDaysMax")),
          active: true,
          breaks,
          confirm: true,
        },
      });
      setMsg("Rate card saved.");
      await load();
      e.currentTarget.reset();
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Failed");
    }
  }

  return (
    <div>
      <PageTitle
        title="AUD sell-rate cards"
        subtitle="India → Australia only. No live FX. Super Admin confirmation required."
      />
      <Panel className="!border-zinc-700 !bg-zinc-950">
        <ul className="space-y-2 text-sm">
          {rates.map((r) => (
            <li key={r.id} className="border-b border-zinc-800 pb-2">
              {r.serviceName} ({r.courierName}) · ETA {r.etaDaysMin}-{r.etaDaysMax}d ·{" "}
              {r.breaks
                .map((b) => `≤${b.upToKg}kg ${formatAudCents(b.priceAudCents)}`)
                .join(" · ")}
            </li>
          ))}
        </ul>
      </Panel>
      <Panel className="mt-4 !border-zinc-700 !bg-zinc-950">
        <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
          <div><Label>Service ID</Label><Input name="serviceId" required /></div>
          <div><Label>Service name</Label><Input name="serviceName" required /></div>
          <div><Label>Courier</Label><Input name="courierName" required /></div>
          <div><Label>ETA min days</Label><Input name="etaDaysMin" type="number" required /></div>
          <div><Label>ETA max days</Label><Input name="etaDaysMax" type="number" required /></div>
          <div className="md:col-span-2">
            <Label>Breaks (kg:cents, comma-separated)</Label>
            <Input name="breaks" placeholder="0.5:2500,1:4000,2:7000" required />
          </div>
          <div className="md:col-span-2">
            <Button type="submit">Save rate card (confirm)</Button>
          </div>
        </form>
        {msg ? <div className="mt-3"><Alert tone="success">{msg}</Alert></div> : null}
        {err ? <div className="mt-3"><Alert tone="danger">{err}</Alert></div> : null}
      </Panel>
    </div>
  );
}

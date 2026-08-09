"use client";

import { useState } from "react";
import { useApi } from "@/lib/hooks/useApi";
import { Alert, Button, Input, Label, PageTitle, Panel } from "@/components/ui/ui";

export default function CompleteConsolidationPage() {
  const { api } = useApi();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    const form = new FormData(e.currentTarget);
    try {
      await api("/api/consolidations", {
        method: "PATCH",
        json: {
          consolidationId: String(form.get("consolidationId")),
          scannedBarcodes: String(form.get("scannedBarcodes"))
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          weightKg: Number(form.get("weightKg")),
          lengthCm: Number(form.get("lengthCm")),
          widthCm: Number(form.get("widthCm")),
          heightCm: Number(form.get("heightCm")),
          binLocation: String(form.get("binLocation")),
          photoPath: String(form.get("photoPath")),
          confirm: true,
        },
      });
      setMsg("Consolidation completed. Quotes invalidated.");
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Failed");
    }
  }

  return (
    <div>
      <PageTitle
        title="Complete consolidation"
        subtitle="Scan mismatch blocks completion. Re-measure and photograph final carton."
      />
      <Panel className="!border-zinc-700 !bg-zinc-950">
        <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
          <div className="md:col-span-2">
            <Label>Consolidation ID</Label>
            <Input name="consolidationId" required />
          </div>
          <div className="md:col-span-2">
            <Label>Scanned barcodes (comma-separated)</Label>
            <Input name="scannedBarcodes" required />
          </div>
          <div><Label>Weight kg</Label><Input name="weightKg" type="number" step="0.01" required /></div>
          <div><Label>Length cm</Label><Input name="lengthCm" type="number" required /></div>
          <div><Label>Width cm</Label><Input name="widthCm" type="number" required /></div>
          <div><Label>Height cm</Label><Input name="heightCm" type="number" required /></div>
          <div><Label>Bin</Label><Input name="binLocation" required /></div>
          <div><Label>Final photo path</Label><Input name="photoPath" required /></div>
          <div className="md:col-span-2">
            <Button type="submit">Confirm complete</Button>
          </div>
        </form>
        {msg ? <div className="mt-3"><Alert tone="success">{msg}</Alert></div> : null}
        {err ? <div className="mt-3"><Alert tone="danger">{err}</Alert></div> : null}
      </Panel>
    </div>
  );
}

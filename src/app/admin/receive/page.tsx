"use client";

import { useState } from "react";
import { useApi } from "@/lib/hooks/useApi";
import { Alert, Button, Input, Label, PageTitle, Panel } from "@/components/ui/ui";

export default function ReceivePage() {
  const { api } = useApi();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    const form = new FormData(e.currentTarget);
    const unidentified = form.get("unidentified") === "on";
    try {
      const data = await api<{ package: { barcode: string; status: string } }>(
        "/api/admin/packages/receive",
        {
          method: "POST",
          json: {
            unidentified,
            indId: unidentified ? undefined : String(form.get("indId") || ""),
            senderStore: String(form.get("senderStore") || ""),
            inboundTracking: String(form.get("inboundTracking") || ""),
            weightKg: Number(form.get("weightKg")),
            lengthCm: Number(form.get("lengthCm")),
            widthCm: Number(form.get("widthCm")),
            heightCm: Number(form.get("heightCm")),
            condition: String(form.get("condition") || "ok"),
            binLocation: String(form.get("binLocation")),
            photoPaths: [
              { kind: "exterior", storagePath: String(form.get("photoExterior")) },
              { kind: "label", storagePath: String(form.get("photoLabel")) },
              ...(form.get("condition") === "damaged"
                ? [{ kind: "damage" as const, storagePath: String(form.get("photoDamage") || "damage/pending") }]
                : []),
            ],
            notes: String(form.get("notes") || ""),
          },
        },
      );
      setMsg(`Received ${data.package.barcode} → ${data.package.status}`);
      e.currentTarget.reset();
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Receive failed");
    }
  }

  return (
    <div>
      <PageTitle
        title="Receive package"
        subtitle="Required photos: exterior + label. Storage clock starts at Stored. No routine opening."
      />
      <Panel className="!border-zinc-700 !bg-zinc-950">
        <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
          <label className="md:col-span-2 flex items-center gap-2 text-sm">
            <input type="checkbox" name="unidentified" /> Unidentified (no valid IND)
          </label>
          <div><Label>IND-XXXXXX</Label><Input name="indId" placeholder="IND-A7K3M2" /></div>
          <div><Label>Bin / shelf</Label><Input name="binLocation" required /></div>
          <div><Label>Store / sender</Label><Input name="senderStore" /></div>
          <div><Label>Inbound tracking</Label><Input name="inboundTracking" /></div>
          <div><Label>Weight kg</Label><Input name="weightKg" type="number" step="0.01" required /></div>
          <div><Label>Length cm</Label><Input name="lengthCm" type="number" required /></div>
          <div><Label>Width cm</Label><Input name="widthCm" type="number" required /></div>
          <div><Label>Height cm</Label><Input name="heightCm" type="number" required /></div>
          <div>
            <Label>Condition</Label>
            <select name="condition" className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm">
              <option value="ok">ok</option>
              <option value="damaged">damaged</option>
              <option value="suspect_prohibited">suspect_prohibited</option>
            </select>
          </div>
          <div><Label>Exterior photo path</Label><Input name="photoExterior" required placeholder="packages/.../exterior.jpg" /></div>
          <div><Label>Label photo path</Label><Input name="photoLabel" required placeholder="packages/.../label.jpg" /></div>
          <div><Label>Damage photo path</Label><Input name="photoDamage" placeholder="required if damaged" /></div>
          <div className="md:col-span-2"><Label>Notes</Label><Input name="notes" /></div>
          <div className="md:col-span-2"><Button type="submit">Complete receive → Stored / Unidentified</Button></div>
        </form>
        {msg ? <div className="mt-3"><Alert tone="success">{msg}</Alert></div> : null}
        {err ? <div className="mt-3"><Alert tone="danger">{err}</Alert></div> : null}
      </Panel>
    </div>
  );
}

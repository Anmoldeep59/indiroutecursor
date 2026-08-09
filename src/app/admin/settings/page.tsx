"use client";

import { useEffect, useState } from "react";
import { Alert, PageTitle, Panel } from "@/components/ui/ui";
import { FROZEN } from "@/lib/config/frozen";

type PublicSettings = {
  warehouseConfigured: boolean;
  pricingReady: boolean;
  handlingFeeAudCents: number | null;
  storageAudCentsPerDay: number | null;
  volumetricDivisor: number | null;
  launchBlockers: string[];
  legalEntityName: string | null;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  useEffect(() => {
    void fetch("/api/settings/public")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => setSettings(null));
  }, []);

  return (
    <div>
      <PageTitle
        title="Settings"
        subtitle="Frozen policy values vs founder-configured env inputs"
       variant="dark" />
      <Panel className="!border-zinc-700 !bg-zinc-950 space-y-2 text-sm">
        <p>Free storage days (frozen): {FROZEN.freeStorageDays}</p>
        <p>Storage fee INR/day (frozen): ₹{FROZEN.storageFeeInrPerDay}</p>
        <p>Quote validity hours (frozen): {FROZEN.quoteValidityHours}</p>
        <p>Abandonment target days (frozen intent): {FROZEN.abandonmentTargetDays}</p>
        <p>Unidentified claim days (frozen): {FROZEN.unidentifiedClaimDays}</p>
        <p>Auto-dispose unidentified: {String(FROZEN.autoDisposeUnidentified)} (must stay false)</p>
        <p>Wallet allowed: {String(FROZEN.walletAllowed)} (must stay false)</p>
      </Panel>
      <Panel className="mt-4 !border-zinc-700 !bg-zinc-950 space-y-2 text-sm">
        <p>Legal entity: {settings?.legalEntityName || "[FOUNDER INPUT REQUIRED]"}</p>
        <p>Warehouse configured: {String(settings?.warehouseConfigured)}</p>
        <p>Handling fee AUD cents: {settings?.handlingFeeAudCents ?? "[FOUNDER INPUT REQUIRED]"}</p>
        <p>
          Storage AUD cents/day:{" "}
          {settings?.storageAudCentsPerDay ?? "[FOUNDER INPUT REQUIRED]"}
        </p>
        <p>
          Volumetric divisor: {settings?.volumetricDivisor ?? "[FOUNDER INPUT REQUIRED]"}
        </p>
        <p>Pricing ready: {String(settings?.pricingReady)}</p>
      </Panel>
      {settings?.launchBlockers?.length ? (
        <div className="mt-4">
          <Alert tone="warn">
            Launch blockers: {settings.launchBlockers.join("; ")}
          </Alert>
        </div>
      ) : null}
    </div>
  );
}

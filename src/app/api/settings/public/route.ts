import { NextResponse } from "next/server";
import {
  formatWarehouseAddress,
  getFounderSettings,
  canChargeShipping,
} from "@/lib/config/founder-settings";
import { FROZEN } from "@/lib/config/frozen";

export async function GET() {
  const settings = getFounderSettings();
  return NextResponse.json({
    supportEmail: settings.supportEmail,
    legalEntityName: settings.legalEntityName,
    warehouseConfigured: Boolean(
      settings.warehouse.line1 && settings.warehouse.city && settings.warehouse.postal,
    ),
    warehouse: settings.warehouse,
    pricingReady: canChargeShipping(settings),
    handlingFeeAudCents: settings.handlingFeeAudCents,
    storageAudCentsPerDay: settings.storageAudCentsPerDay,
    volumetricDivisor: settings.volumetricDivisor,
    emailChangeInBeta: settings.emailChangeInBeta,
    frozen: {
      freeStorageDays: FROZEN.freeStorageDays,
      storageFeeInrPerDay: FROZEN.storageFeeInrPerDay,
      quoteValidityHours: FROZEN.quoteValidityHours,
      corridor: "AU",
    },
    launchBlockers: settings.launchBlockers,
  });
}

export async function POST(req: Request) {
  // Format address for a verified customer display name + IND
  const body = (await req.json()) as { indId?: string; name?: string };
  const settings = getFounderSettings();
  if (!body.indId || !body.name) {
    return NextResponse.json({ lines: null });
  }
  return NextResponse.json({
    lines: formatWarehouseAddress(settings, body.indId, body.name),
  });
}

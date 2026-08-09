import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { estimateChargeableWeight, priceFromRateCard } from "@/lib/domain/quotes";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { getFounderSettings } from "@/lib/config/founder-settings";
import type { RateCard } from "@/lib/types";

const schema = z.object({
  country: z.string(),
  postal: z.string().optional(),
  weightKg: z.number().positive(),
  lengthCm: z.number().positive(),
  widthCm: z.number().positive(),
  heightCm: z.number().positive(),
  packageType: z.enum(["parcel", "document"]).default("parcel"),
});

export async function POST(req: NextRequest) {
  const body = schema.parse(await req.json());
  if (body.country !== "AU") {
    return NextResponse.json({
      estimate: null,
      disclaimer: "Beta estimates are available for Australia only.",
      payable: false,
    });
  }

  const weights = estimateChargeableWeight(body);
  const settings = getFounderSettings();
  let options: {
    serviceName: string;
    courierName: string;
    shippingAudCents: number | null;
    etaDaysMin: number;
    etaDaysMax: number;
  }[] = [];

  if (isAdminConfigured() && weights.chargeable !== null) {
    const snap = await adminDb()
      .collection(COLLECTIONS.rateCards)
      .where("active", "==", true)
      .where("destinationCountry", "==", "AU")
      .get();
    options = snap.docs.map((d) => {
      const card = d.data() as RateCard;
      return {
        serviceName: card.serviceName,
        courierName: card.courierName,
        shippingAudCents: priceFromRateCard(card, weights.chargeable!),
        etaDaysMin: card.etaDaysMin,
        etaDaysMax: card.etaDaysMax,
      };
    });
  }

  return NextResponse.json({
    payable: false,
    disclaimer: weights.disclaimer,
    chargeableWeightKg: weights.chargeable,
    actualWeightKg: weights.actual,
    volumetricWeightKg: weights.volumetric,
    volumetricDivisorConfigured: settings.volumetricDivisor !== null,
    handlingFeeConfigured: settings.handlingFeeAudCents !== null,
    options,
  });
}

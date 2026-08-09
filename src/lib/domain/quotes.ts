import { FROZEN } from "@/lib/config/frozen";
import { getFounderSettings } from "@/lib/config/founder-settings";
import type { QuoteOption, RateCard } from "@/lib/types";
import { addHours, isBefore, parseISO } from "date-fns";

export function volumetricWeightKg(
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  divisor?: number | null,
): number | null {
  const d = divisor ?? getFounderSettings().volumetricDivisor;
  if (!d || d <= 0) return null;
  return (lengthCm * widthCm * heightCm) / d;
}

export function chargeableWeightKg(input: {
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}): { actual: number; volumetric: number | null; chargeable: number | null } {
  const volumetric = volumetricWeightKg(
    input.lengthCm,
    input.widthCm,
    input.heightCm,
  );
  if (volumetric === null) {
    return { actual: input.weightKg, volumetric: null, chargeable: null };
  }
  return {
    actual: input.weightKg,
    volumetric,
    chargeable: Math.max(input.weightKg, volumetric),
  };
}

export function priceFromRateCard(
  card: RateCard,
  chargeableKg: number,
): number | null {
  if (!card.active || card.destinationCountry !== "AU") return null;
  const sorted = [...card.breaks].sort((a, b) => a.upToKg - b.upToKg);
  const match = sorted.find((b) => chargeableKg <= b.upToKg);
  return match ? match.priceAudCents : null;
}

export function buildQuoteOptions(input: {
  cards: RateCard[];
  chargeableKg: number;
  storageAudCents: number;
}): QuoteOption[] | null {
  const settings = getFounderSettings();
  if (settings.handlingFeeAudCents === null) return null;

  const options: QuoteOption[] = [];
  for (const card of input.cards) {
    const shipping = priceFromRateCard(card, input.chargeableKg);
    if (shipping === null) continue;
    const handling = settings.handlingFeeAudCents;
    options.push({
      serviceId: card.serviceId,
      serviceName: card.serviceName,
      courierName: card.courierName,
      etaDaysMin: card.etaDaysMin,
      etaDaysMax: card.etaDaysMax,
      shippingAudCents: shipping,
      handlingAudCents: handling,
      storageAudCents: input.storageAudCents,
      totalAudCents: shipping + handling + input.storageAudCents,
    });
  }
  return options;
}

export function quoteExpiresAt(from = new Date()): Date {
  return addHours(from, FROZEN.quoteValidityHours);
}

export function isQuotePayable(expiresAt: string, status: string, now = new Date()): boolean {
  if (status !== "open" && status !== "selected") return false;
  return isBefore(now, parseISO(expiresAt));
}

/** Public calculator estimate — never payable */
export function estimateChargeableWeight(input: {
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}): { actual: number; volumetric: number | null; chargeable: number | null; disclaimer: string } {
  const result = chargeableWeightKg(input);
  return {
    ...result,
    disclaimer:
      "Estimate only. Final payable quotes use warehouse-recorded weight and dimensions.",
  };
}

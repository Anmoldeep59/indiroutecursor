import { FROZEN } from "./frozen";

export type FounderSettings = {
  legalEntityName: string | null;
  legalEntityDetails: string | null;
  warehouse: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postal: string | null;
    country: string;
  };
  supportEmail: string;
  handlingFeeAudCents: number | null;
  handlingFeeType: "flat" | "tiered";
  storageAudCentsPerDay: number | null;
  volumetricDivisor: number | null;
  maxDeclaredValueAudCents: number | null;
  indAlphabet: string;
  emailChangeInBeta: boolean;
  stripeStatementDescriptor: string;
  resendFromEmail: string;
  launchBlockers: string[];
};

function emptyToNull(value: string | undefined): string | null {
  if (!value || value.trim() === "") return null;
  return value.trim();
}

function parseOptionalInt(value: string | undefined): number | null {
  if (value === undefined || value.trim() === "") return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

/** Read founder-supplied config. Never invent monetary amounts. */
export function getFounderSettings(): FounderSettings {
  const handlingFeeAudCents = parseOptionalInt(
    process.env.FOUNDER_HANDLING_FEE_AUD_CENTS,
  );
  const storageAudCentsPerDay = parseOptionalInt(
    process.env.FOUNDER_STORAGE_AUD_CENTS_PER_DAY,
  );
  const volumetricDivisor = parseOptionalInt(
    process.env.FOUNDER_VOLUMETRIC_DIVISOR,
  );
  const maxDeclaredValueAudCents = parseOptionalInt(
    process.env.FOUNDER_MAX_DECLARED_VALUE_AUD_CENTS,
  );

  const warehouse = {
    line1: emptyToNull(process.env.FOUNDER_WAREHOUSE_LINE1),
    line2: emptyToNull(process.env.FOUNDER_WAREHOUSE_LINE2),
    city: emptyToNull(process.env.FOUNDER_WAREHOUSE_CITY),
    state: emptyToNull(process.env.FOUNDER_WAREHOUSE_STATE),
    postal: emptyToNull(process.env.FOUNDER_WAREHOUSE_POSTAL),
    country: process.env.FOUNDER_WAREHOUSE_COUNTRY?.trim() || "India",
  };

  const launchBlockers: string[] = [];
  if (!warehouse.line1 || !warehouse.city || !warehouse.postal) {
    launchBlockers.push("Warehouse address incomplete");
  }
  if (handlingFeeAudCents === null) {
    launchBlockers.push("Handling fee AUD not set (set cents or 0 explicitly)");
  }
  if (storageAudCentsPerDay === null) {
    launchBlockers.push("Storage AUD cents/day conversion not set");
  }
  if (volumetricDivisor === null) {
    launchBlockers.push("Volumetric divisor not set");
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    launchBlockers.push("Stripe secret key missing");
  }
  if (!emptyToNull(process.env.FOUNDER_LEGAL_ENTITY_NAME)) {
    launchBlockers.push("Legal entity name missing");
  }

  return {
    legalEntityName: emptyToNull(process.env.FOUNDER_LEGAL_ENTITY_NAME),
    legalEntityDetails: emptyToNull(process.env.FOUNDER_LEGAL_ENTITY_DETAILS),
    warehouse,
    supportEmail:
      emptyToNull(process.env.FOUNDER_SUPPORT_EMAIL) ?? "support@indiroute.co",
    handlingFeeAudCents,
    handlingFeeType:
      process.env.FOUNDER_HANDLING_FEE_TYPE === "tiered" ? "tiered" : "flat",
    storageAudCentsPerDay,
    volumetricDivisor,
    maxDeclaredValueAudCents,
    indAlphabet:
      emptyToNull(process.env.FOUNDER_IND_ALPHABET) ?? FROZEN.defaultIndAlphabet,
    emailChangeInBeta: process.env.FOUNDER_EMAIL_CHANGE_IN_BETA === "true",
    stripeStatementDescriptor:
      emptyToNull(process.env.STRIPE_STATEMENT_DESCRIPTOR) ?? "INDIROUTE",
    resendFromEmail:
      emptyToNull(process.env.RESEND_FROM_EMAIL) ?? "noreply@indiroute.co",
    launchBlockers,
  };
}

export function formatWarehouseAddress(
  settings: FounderSettings,
  indId: string,
  customerName: string,
): string[] | null {
  const { warehouse } = settings;
  if (!warehouse.line1 || !warehouse.city || !warehouse.postal) return null;
  const lines = [
    `${customerName} ${indId}`,
    warehouse.line1,
    warehouse.line2,
    `${warehouse.city}${warehouse.state ? `, ${warehouse.state}` : ""} ${warehouse.postal}`,
    warehouse.country,
  ].filter((line): line is string => Boolean(line && line.trim()));
  return lines;
}

export function canChargeShipping(settings: FounderSettings): boolean {
  return (
    settings.handlingFeeAudCents !== null &&
    settings.volumetricDivisor !== null &&
    settings.storageAudCentsPerDay !== null
  );
}

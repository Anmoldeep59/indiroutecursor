import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { requireCustomer } from "@/lib/server/auth";
import {
  buildQuoteOptions,
  chargeableWeightKg,
  quoteExpiresAt,
} from "@/lib/domain/quotes";
import { storageDueAudCents } from "@/lib/domain/storage";
import { getFounderSettings } from "@/lib/config/founder-settings";
import type { PackageRecord, RateCard, ShippingQuote } from "@/lib/types";

const schema = z.object({
  packageIds: z.array(z.string()).min(1),
  destination: z.object({
    name: z.string().min(1),
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postal: z.string().min(1),
    country: z.literal("AU"),
    phone: z.string().optional(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const { identity, profile } = await requireCustomer(
      req.headers.get("authorization"),
    );
    if (!identity.emailVerified || !profile.indId) {
      return NextResponse.json({ error: "Email verification required" }, { status: 403 });
    }

    const settings = getFounderSettings();
    if (
      settings.handlingFeeAudCents === null ||
      settings.volumetricDivisor === null ||
      settings.storageAudCentsPerDay === null
    ) {
      return NextResponse.json(
        {
          error:
            "Pricing not configured — founder must set handling fee, volumetric divisor, and storage AUD conversion",
          founderInputRequired: true,
        },
        { status: 503 },
      );
    }

    const body = schema.parse(await req.json());
    if (body.destination.country !== "AU") {
      return NextResponse.json(
        { error: "Beta ships to Australia only" },
        { status: 400 },
      );
    }

    const packages: PackageRecord[] = [];
    for (const id of body.packageIds) {
      const snap = await adminDb().collection(COLLECTIONS.packages).doc(id).get();
      if (!snap.exists) {
        return NextResponse.json({ error: "Package not found" }, { status: 404 });
      }
      const pkg = snap.data() as PackageRecord;
      if (pkg.userId !== identity.uid) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (pkg.consolidatedIntoId) {
        return NextResponse.json(
          { error: "Package was consolidated into another unit" },
          { status: 400 },
        );
      }
      if (pkg.status !== "Stored") {
        return NextResponse.json(
          { error: "Only Stored packages can be quoted" },
          { status: 400 },
        );
      }
      if (
        pkg.weightKg == null ||
        pkg.lengthCm == null ||
        pkg.widthCm == null ||
        pkg.heightCm == null
      ) {
        return NextResponse.json(
          { error: "Warehouse measurements required before payable quote" },
          { status: 400 },
        );
      }
      const hasExterior = pkg.photos.some((p) => p.kind === "exterior");
      const hasLabel = pkg.photos.some((p) => p.kind === "label");
      if (!hasExterior || !hasLabel) {
        return NextResponse.json(
          { error: "Required receive photos missing" },
          { status: 400 },
        );
      }
      packages.push(pkg);
    }

    // Single package or one consolidated unit for Beta quote simplicity
    if (packages.length !== 1) {
      return NextResponse.json(
        {
          error:
            "Select one Stored package (consolidate first if shipping multiple together)",
        },
        { status: 400 },
      );
    }

    const pkg = packages[0]!;
    const weights = chargeableWeightKg({
      weightKg: pkg.weightKg!,
      lengthCm: pkg.lengthCm!,
      widthCm: pkg.widthCm!,
      heightCm: pkg.heightCm!,
    });
    if (weights.chargeable === null || weights.volumetric === null) {
      return NextResponse.json(
        { error: "Volumetric divisor not configured" },
        { status: 503 },
      );
    }

    const storageCents = pkg.storedAt ? storageDueAudCents(pkg.storedAt) : 0;
    if (storageCents === null) {
      return NextResponse.json(
        { error: "Storage AUD conversion not configured" },
        { status: 503 },
      );
    }

    const rateSnap = await adminDb()
      .collection(COLLECTIONS.rateCards)
      .where("active", "==", true)
      .where("destinationCountry", "==", "AU")
      .get();
    const cards = rateSnap.docs.map((d) => d.data() as RateCard);
    const options = buildQuoteOptions({
      cards,
      chargeableKg: weights.chargeable,
      storageAudCents: storageCents,
    });
    if (!options || options.length === 0) {
      return NextResponse.json(
        { error: "No AUD rate cards configured for this weight" },
        { status: 503 },
      );
    }

    const now = new Date();
    const quote: ShippingQuote = {
      id: randomUUID(),
      userId: identity.uid,
      packageIds: [pkg.id],
      chargeableWeightKg: weights.chargeable,
      actualWeightKg: weights.actual,
      volumetricWeightKg: weights.volumetric,
      destination: body.destination,
      options,
      status: "open",
      expiresAt: quoteExpiresAt(now).toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await adminDb().collection(COLLECTIONS.quotes).doc(quote.id).set(quote);
    await adminDb().collection(COLLECTIONS.packages).doc(pkg.id).update({
      status: "Awaiting Payment",
      updatedAt: now.toISOString(),
    });

    return NextResponse.json({ quote });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(error);
    return NextResponse.json({ error: "Quote failed" }, { status: 500 });
  }
}

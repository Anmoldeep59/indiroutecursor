import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { requireCustomer } from "@/lib/server/auth";
import { isQuotePayable } from "@/lib/domain/quotes";
import { createShippingCheckoutSession } from "@/lib/stripe/server";
import type { PaymentRecord, ShippingQuote, ShipmentRecord } from "@/lib/types";
import { FROZEN } from "@/lib/config/frozen";

const schema = z.object({
  quoteId: z.string(),
  serviceId: z.string(),
  customsItems: z
    .array(
      z.object({
        description: z.string().min(1),
        quantity: z.number().int().positive(),
        valueAudCents: z.number().int().nonnegative(),
        originCountry: z.string().default("IN"),
      }),
    )
    .min(1),
});

export async function POST(req: NextRequest) {
  try {
    if (FROZEN.walletAllowed) {
      return NextResponse.json({ error: "Wallet forbidden" }, { status: 500 });
    }
    const { identity, profile } = await requireCustomer(
      req.headers.get("authorization"),
    );
    const body = schema.parse(await req.json());
    const quoteSnap = await adminDb()
      .collection(COLLECTIONS.quotes)
      .doc(body.quoteId)
      .get();
    if (!quoteSnap.exists) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }
    const quote = quoteSnap.data() as ShippingQuote;
    if (quote.userId !== identity.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!isQuotePayable(quote.expiresAt, quote.status)) {
      await adminDb().collection(COLLECTIONS.quotes).doc(quote.id).update({
        status: "expired",
        updatedAt: new Date().toISOString(),
      });
      for (const pkgId of quote.packageIds) {
        await adminDb().collection(COLLECTIONS.packages).doc(pkgId).update({
          status: "Stored",
          updatedAt: new Date().toISOString(),
        });
      }
      return NextResponse.json(
        { error: "Quote expired — regenerate" },
        { status: 400 },
      );
    }

    const option = quote.options.find((o) => o.serviceId === body.serviceId);
    if (!option) {
      return NextResponse.json({ error: "Invalid service" }, { status: 400 });
    }
    if (quote.destination.country !== "AU") {
      return NextResponse.json({ error: "AU only" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const paymentId = randomUUID();
    const shipmentId = randomUUID();

    const lineItems = [
      { label: `Shipping — ${option.serviceName}`, amountAudCents: option.shippingAudCents },
      { label: "Handling", amountAudCents: option.handlingAudCents },
    ];
    if (option.storageAudCents > 0) {
      lineItems.push({
        label: "Storage charges",
        amountAudCents: option.storageAudCents,
      });
    }

    const payment: PaymentRecord = {
      id: paymentId,
      userId: identity.uid,
      purpose: "shipping",
      amountAudCents: option.totalAudCents,
      currency: "aud",
      status: "pending",
      quoteId: quote.id,
      shipmentId,
      lineItems,
      createdAt: now,
      updatedAt: now,
    };

    const shipment: ShipmentRecord = {
      id: shipmentId,
      userId: identity.uid,
      packageIds: quote.packageIds,
      quoteId: quote.id,
      paymentId,
      status: "Awaiting Payment",
      customsItems: body.customsItems,
      destination: quote.destination,
      createdAt: now,
      updatedAt: now,
    };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const session = await createShippingCheckoutSession({
      userId: identity.uid,
      email: profile.email,
      quoteId: quote.id,
      shipmentId,
      paymentId,
      lineItems,
      successUrl: `${appUrl}/dashboard/payments?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/dashboard/ship?checkout=cancel`,
    });

    payment.stripeCheckoutSessionId = session.id;

    const batch = adminDb().batch();
    batch.set(adminDb().collection(COLLECTIONS.payments).doc(paymentId), payment);
    batch.set(adminDb().collection(COLLECTIONS.shipments).doc(shipmentId), shipment);
    batch.update(adminDb().collection(COLLECTIONS.quotes).doc(quote.id), {
      selectedServiceId: body.serviceId,
      status: "selected",
      updatedAt: now,
    });
    await batch.commit();

    // Client success redirect must NOT mark paid — webhook is source of truth
    return NextResponse.json({ url: session.url, paymentId, shipmentId });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}

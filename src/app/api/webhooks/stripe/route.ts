import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getStripe } from "@/lib/stripe/server";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { notifyUser } from "@/lib/server/notifications";
import type { InvoiceRecord, PaymentRecord, UserProfile } from "@/lib/types";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error("Stripe signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = session.metadata?.paymentId;
      const shipmentId = session.metadata?.shipmentId;
      const quoteId = session.metadata?.quoteId;
      const userId = session.metadata?.userId;
      if (!paymentId || !shipmentId || !quoteId || !userId) {
        return NextResponse.json({ received: true, ignored: true });
      }

      const paymentRef = adminDb().collection(COLLECTIONS.payments).doc(paymentId);
      const paymentSnap = await paymentRef.get();
      if (!paymentSnap.exists) {
        return NextResponse.json({ received: true, missing: true });
      }
      const payment = paymentSnap.data() as PaymentRecord;
      if (payment.status === "succeeded") {
        // Idempotent — do not double-advance
        return NextResponse.json({ received: true, duplicate: true });
      }

      const now = new Date().toISOString();
      const batch = adminDb().batch();
      batch.update(paymentRef, {
        status: "succeeded",
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id,
        updatedAt: now,
      });
      batch.update(adminDb().collection(COLLECTIONS.shipments).doc(shipmentId), {
        status: "Ready to Ship",
        updatedAt: now,
      });
      batch.update(adminDb().collection(COLLECTIONS.quotes).doc(quoteId), {
        status: "paid",
        updatedAt: now,
      });

      const shipmentSnap = await adminDb()
        .collection(COLLECTIONS.shipments)
        .doc(shipmentId)
        .get();
      const packageIds = (shipmentSnap.data()?.packageIds as string[]) ?? [];
      for (const pkgId of packageIds) {
        batch.update(adminDb().collection(COLLECTIONS.packages).doc(pkgId), {
          status: "Ready to Ship",
          shipmentId,
          updatedAt: now,
        });
      }

      const invoiceId = randomUUID();
      const invoice: InvoiceRecord = {
        id: invoiceId,
        userId,
        paymentId,
        number: `INV-${invoiceId.slice(0, 8).toUpperCase()}`,
        lineItems: payment.lineItems,
        totalAudCents: payment.amountAudCents,
        currency: "aud",
        createdAt: now,
      };
      batch.set(adminDb().collection(COLLECTIONS.invoices).doc(invoiceId), invoice);
      await batch.commit();

      const user = (
        await adminDb().collection(COLLECTIONS.users).doc(userId).get()
      ).data() as UserProfile | undefined;
      await notifyUser({
        userId,
        email: user?.email,
        type: "payment_successful",
        title: "Payment successful",
        body: "Your shipment is Ready to Ship. We will dispatch and share tracking soon.",
        entityType: "shipment",
        entityId: shipmentId,
      });
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = session.metadata?.paymentId;
      if (paymentId) {
        await adminDb().collection(COLLECTIONS.payments).doc(paymentId).update({
          status: "failed",
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

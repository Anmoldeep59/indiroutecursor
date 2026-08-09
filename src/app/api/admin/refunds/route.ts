import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { requireStaff } from "@/lib/server/auth";
import { assertCan } from "@/lib/domain/permissions";
import { writeAuditLog } from "@/lib/server/audit";
import { notifyUser } from "@/lib/server/notifications";
import { getStripe } from "@/lib/stripe/server";
import type { PaymentRecord } from "@/lib/types";

const schema = z.object({
  paymentId: z.string(),
  amountAudCents: z.number().int().positive(),
  reason: z.string().min(3),
  confirm: z.literal(true),
});

export async function POST(req: NextRequest) {
  try {
    const { identity, staff } = await requireStaff(req.headers.get("authorization"), [
      "super_admin",
    ]);
    assertCan({ kind: "staff", uid: identity.uid, role: staff.role }, "refund");
    const body = schema.parse(await req.json());
    const paymentRef = adminDb().collection(COLLECTIONS.payments).doc(body.paymentId);
    const snap = await paymentRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }
    const payment = snap.data() as PaymentRecord;
    if (payment.status !== "succeeded" && payment.status !== "partial_refund") {
      return NextResponse.json({ error: "Payment not refundable" }, { status: 400 });
    }
    if (!payment.stripePaymentIntentId) {
      return NextResponse.json({ error: "Missing PaymentIntent" }, { status: 400 });
    }
    if (body.amountAudCents > payment.amountAudCents) {
      return NextResponse.json({ error: "Amount too high" }, { status: 400 });
    }

    const stripe = getStripe();
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: body.amountAudCents,
      reason: "requested_by_customer",
      metadata: { paymentId: payment.id, reason: body.reason },
    });

    const now = new Date().toISOString();
    const refundId = randomUUID();
    const full = body.amountAudCents === payment.amountAudCents;
    await adminDb().collection(COLLECTIONS.refunds).doc(refundId).set({
      id: refundId,
      paymentId: payment.id,
      amountAudCents: body.amountAudCents,
      reason: body.reason,
      createdBy: identity.uid,
      stripeRefundId: refund.id,
      createdAt: now,
    });
    await paymentRef.update({
      status: full ? "refunded" : "partial_refund",
      updatedAt: now,
    });

    await writeAuditLog({
      actorId: identity.uid,
      actorEmail: identity.email ?? staff.email,
      action: "refund",
      entityType: "payment",
      entityId: payment.id,
      after: { amountAudCents: body.amountAudCents, stripeRefundId: refund.id },
      reason: body.reason,
    });

    const user = (
      await adminDb().collection(COLLECTIONS.users).doc(payment.userId).get()
    ).data();
    await notifyUser({
      userId: payment.userId,
      email: user?.email,
      type: "refund_issued",
      title: "Refund issued",
      body: `A refund of AUD ${(body.amountAudCents / 100).toFixed(2)} was issued. Reason: ${body.reason}`,
      entityType: "payment",
      entityId: payment.id,
    });

    return NextResponse.json({ ok: true, refundId });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(error);
    return NextResponse.json({ error: "Refund failed" }, { status: 500 });
  }
}

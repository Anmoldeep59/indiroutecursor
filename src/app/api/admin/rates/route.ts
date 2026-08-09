import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { requireStaff } from "@/lib/server/auth";
import { assertCan } from "@/lib/domain/permissions";
import { writeAuditLog } from "@/lib/server/audit";
import type { RateCard } from "@/lib/types";

const schema = z.object({
  serviceId: z.string().min(1),
  serviceName: z.string().min(1),
  courierName: z.string().min(1),
  etaDaysMin: z.number().int().positive(),
  etaDaysMax: z.number().int().positive(),
  active: z.boolean().default(true),
  breaks: z
    .array(z.object({ upToKg: z.number().positive(), priceAudCents: z.number().int().nonnegative() }))
    .min(1),
  confirm: z.literal(true),
});

export async function GET(req: NextRequest) {
  try {
    await requireStaff(req.headers.get("authorization"));
    const snap = await adminDb().collection(COLLECTIONS.rateCards).get();
    return NextResponse.json({
      rates: snap.docs.map((d) => d.data()),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { identity, staff } = await requireStaff(req.headers.get("authorization"), [
      "super_admin",
    ]);
    assertCan({ kind: "staff", uid: identity.uid, role: staff.role }, "edit_rates");
    const body = schema.parse(await req.json());
    const now = new Date().toISOString();
    const id = randomUUID();
    const card: RateCard = {
      id,
      serviceId: body.serviceId,
      serviceName: body.serviceName,
      courierName: body.courierName,
      destinationCountry: "AU",
      etaDaysMin: body.etaDaysMin,
      etaDaysMax: body.etaDaysMax,
      active: body.active,
      breaks: body.breaks,
      updatedAt: now,
      updatedBy: identity.uid,
    };
    await adminDb().collection(COLLECTIONS.rateCards).doc(id).set(card);
    await writeAuditLog({
      actorId: identity.uid,
      actorEmail: identity.email ?? staff.email,
      action: "edit_rates",
      entityType: "rateCard",
      entityId: id,
      after: card,
      reason: "create/update rate card",
    });
    return NextResponse.json({ rate: card });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(error);
    return NextResponse.json({ error: "Rate save failed" }, { status: 500 });
  }
}

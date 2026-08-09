import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { requireStaff } from "@/lib/server/auth";
import { assertCan } from "@/lib/domain/permissions";
import { assertTransition } from "@/lib/domain/statuses";
import { writeAuditLog } from "@/lib/server/audit";
import { notifyUser } from "@/lib/server/notifications";
import type { PackageStatus } from "@/lib/config/frozen";
import type { ShipmentRecord } from "@/lib/types";

const dispatchSchema = z.object({
  shipmentId: z.string(),
  courierName: z.string().min(1),
  trackingNumber: z.string().min(1),
  dispatchPhotoPath: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { identity, staff } = await requireStaff(req.headers.get("authorization"));
    assertCan({ kind: "staff", uid: identity.uid, role: staff.role }, "mark_shipped");
    const body = dispatchSchema.parse(await req.json());
    const ref = adminDb().collection(COLLECTIONS.shipments).doc(body.shipmentId);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const shipment = snap.data() as ShipmentRecord;
    assertTransition(shipment.status, "Shipped");
    if (shipment.status !== "Ready to Ship") {
      return NextResponse.json(
        { error: "Dispatch only from Ready to Ship (paid)" },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const batch = adminDb().batch();
    batch.update(ref, {
      status: "Shipped",
      courierName: body.courierName,
      trackingNumber: body.trackingNumber,
      shippedAt: now,
      updatedAt: now,
    });
    for (const pkgId of shipment.packageIds) {
      batch.update(adminDb().collection(COLLECTIONS.packages).doc(pkgId), {
        status: "Shipped",
        updatedAt: now,
      });
    }
    await batch.commit();

    await writeAuditLog({
      actorId: identity.uid,
      actorEmail: identity.email ?? staff.email,
      action: "mark_shipped",
      entityType: "shipment",
      entityId: body.shipmentId,
      after: { courierName: body.courierName, trackingNumber: body.trackingNumber },
    });

    const user = (
      await adminDb().collection(COLLECTIONS.users).doc(shipment.userId).get()
    ).data();
    await notifyUser({
      userId: shipment.userId,
      email: user?.email,
      type: "package_shipped",
      title: "Package shipped",
      body: `Courier: ${body.courierName}. Tracking: ${body.trackingNumber}`,
      entityType: "shipment",
      entityId: body.shipmentId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(error);
    return NextResponse.json({ error: "Dispatch failed" }, { status: 500 });
  }
}

const milestoneSchema = z.object({
  shipmentId: z.string(),
  status: z.enum([
    "In Transit",
    "Customs",
    "Out for Delivery",
    "Delivered",
    "Returned",
    "Exception",
  ]),
  reason: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const { identity, staff } = await requireStaff(req.headers.get("authorization"));
    assertCan(
      { kind: "staff", uid: identity.uid, role: staff.role },
      "update_milestones",
    );
    const body = milestoneSchema.parse(await req.json());
    const ref = adminDb().collection(COLLECTIONS.shipments).doc(body.shipmentId);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const shipment = snap.data() as ShipmentRecord;
    assertTransition(shipment.status, body.status as PackageStatus);

    const now = new Date().toISOString();
    const update: Record<string, unknown> = {
      status: body.status,
      updatedAt: now,
    };
    if (body.status === "Delivered") update.deliveredAt = now;

    const batch = adminDb().batch();
    batch.update(ref, update);
    for (const pkgId of shipment.packageIds) {
      batch.update(adminDb().collection(COLLECTIONS.packages).doc(pkgId), {
        status: body.status,
        updatedAt: now,
      });
    }
    await batch.commit();

    const throttle = ["Customs", "Out for Delivery", "Delivered", "Exception"];
    if (throttle.includes(body.status) || body.status === "In Transit") {
      const user = (
        await adminDb().collection(COLLECTIONS.users).doc(shipment.userId).get()
      ).data();
      const type =
        body.status === "Delivered"
          ? "delivered"
          : body.status === "Exception"
            ? "damaged_exception"
            : "tracking_update";
      await notifyUser({
        userId: shipment.userId,
        email: user?.email,
        type,
        title: `Shipment update: ${body.status}`,
        body: body.reason || `Your shipment is now ${body.status}.`,
        entityType: "shipment",
        entityId: body.shipmentId,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(error);
    return NextResponse.json({ error: "Milestone update failed" }, { status: 500 });
  }
}

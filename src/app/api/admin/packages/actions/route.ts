import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { requireStaff } from "@/lib/server/auth";
import { assertCan } from "@/lib/domain/permissions";
import { writeAuditLog } from "@/lib/server/audit";
import { notifyUser } from "@/lib/server/notifications";
import { normalizeIndId, isValidIndId } from "@/lib/domain/ind";
import type { PackageRecord } from "@/lib/types";

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("reassign"),
    packageId: z.string(),
    indId: z.string(),
    reason: z.string().min(3),
    confirm: z.literal(true),
  }),
  z.object({
    action: z.literal("open"),
    packageId: z.string(),
    reason: z.enum([
      "documented_damage",
      "prohibited_concern",
      "customer_authorized",
      "assisted_purchase_verification",
    ]),
    photoPath: z.string().min(1),
    confirm: z.literal(true),
  }),
  z.object({
    action: z.literal("dispose"),
    packageId: z.string(),
    reason: z.string().min(3),
    confirm: z.literal(true),
  }),
  z.object({
    action: z.literal("match_unidentified"),
    packageId: z.string(),
    indId: z.string(),
    reason: z.string().min(3),
    confirm: z.literal(true),
  }),
]);

export async function POST(req: NextRequest) {
  try {
    const { identity, staff } = await requireStaff(req.headers.get("authorization"));
    const body = schema.parse(await req.json());
    const ref = adminDb().collection(COLLECTIONS.packages).doc(body.packageId);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const before = snap.data() as PackageRecord;
    const now = new Date().toISOString();

    if (body.action === "reassign" || body.action === "match_unidentified") {
      assertCan(
        { kind: "staff", uid: identity.uid, role: staff.role },
        body.action === "reassign" ? "reassign_package" : "receive_package",
      );
      if (body.action === "reassign" && staff.role !== "super_admin") {
        return NextResponse.json({ error: "Super Admin only" }, { status: 403 });
      }
      const indId = normalizeIndId(body.indId);
      if (!isValidIndId(indId)) {
        return NextResponse.json({ error: "Invalid IND" }, { status: 400 });
      }
      const indSnap = await adminDb().collection(COLLECTIONS.indIndex).doc(indId).get();
      if (!indSnap.exists) {
        return NextResponse.json({ error: "IND not found" }, { status: 404 });
      }
      const userId = indSnap.data()?.uid as string;
      const after = {
        userId,
        indId,
        status: "Stored",
        storedAt: before.storedAt ?? now,
        unidentifiedAt: null,
        updatedAt: now,
      };
      await ref.update(after);
      await writeAuditLog({
        actorId: identity.uid,
        actorEmail: identity.email ?? staff.email,
        action: body.action,
        entityType: "package",
        entityId: body.packageId,
        before,
        after,
        reason: body.reason,
      });
      const user = (
        await adminDb().collection(COLLECTIONS.users).doc(userId).get()
      ).data();
      await notifyUser({
        userId,
        email: user?.email,
        type: "package_received",
        title: "Package added to your account",
        body: `Package ${before.barcode} is now stored under ${indId}.`,
        entityType: "package",
        entityId: body.packageId,
      });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "open") {
      assertCan({ kind: "staff", uid: identity.uid, role: staff.role }, "open_package");
      // Assisted purchase verification allowed in rules but AP itself is P1
      await ref.update({
        opened: {
          reason: body.reason,
          at: now,
          by: identity.uid,
          photoIds: [],
        },
        photos: [
          ...before.photos,
          {
            id: crypto.randomUUID(),
            kind: "contents",
            storagePath: body.photoPath,
            createdAt: now,
            createdBy: identity.uid,
          },
        ],
        updatedAt: now,
      });
      await writeAuditLog({
        actorId: identity.uid,
        actorEmail: identity.email ?? staff.email,
        action: "open_package",
        entityType: "package",
        entityId: body.packageId,
        reason: body.reason,
      });
      if (before.userId) {
        const user = (
          await adminDb().collection(COLLECTIONS.users).doc(before.userId).get()
        ).data();
        await notifyUser({
          userId: before.userId,
          email: user?.email,
          type: "package_opened",
          title: "Package opened for inspection",
          body: `Reason: ${body.reason.replaceAll("_", " ")}. Photos were recorded.`,
          entityType: "package",
          entityId: body.packageId,
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (body.action === "dispose") {
      assertCan({ kind: "staff", uid: identity.uid, role: staff.role }, "dispose");
      if (staff.role !== "super_admin") {
        return NextResponse.json({ error: "Super Admin only" }, { status: 403 });
      }
      // Never auto — manual only after Terms/notices/legal
      await ref.update({ status: "Disposed", updatedAt: now });
      await writeAuditLog({
        actorId: identity.uid,
        actorEmail: identity.email ?? staff.email,
        action: "dispose",
        entityType: "package",
        entityId: body.packageId,
        before: { status: before.status },
        after: { status: "Disposed" },
        reason: body.reason,
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}

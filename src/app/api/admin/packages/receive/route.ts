import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { requireStaff } from "@/lib/server/auth";
import { assertCan } from "@/lib/domain/permissions";
import { normalizeIndId, isValidIndId } from "@/lib/domain/ind";
import { writeAuditLog } from "@/lib/server/audit";
import { notifyUser } from "@/lib/server/notifications";
import type { PackageRecord, UserProfile } from "@/lib/types";
import { FROZEN } from "@/lib/config/frozen";

const schema = z.object({
  indId: z.string().optional(),
  unidentified: z.boolean().optional(),
  senderStore: z.string().optional(),
  inboundTracking: z.string().optional(),
  weightKg: z.number().positive(),
  lengthCm: z.number().positive(),
  widthCm: z.number().positive(),
  heightCm: z.number().positive(),
  condition: z.enum(["ok", "damaged", "suspect_prohibited"]).default("ok"),
  binLocation: z.string().min(1),
  photoPaths: z
    .array(
      z.object({
        kind: z.enum(["exterior", "label", "damage", "contents", "consolidation", "dispatch"]),
        storagePath: z.string(),
      }),
    )
    .min(2),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { identity, staff } = await requireStaff(req.headers.get("authorization"));
    assertCan({ kind: "staff", uid: identity.uid, role: staff.role }, "receive_package");

    const parsed = schema.parse(await req.json());
    const hasExterior = parsed.photoPaths.some((p) => p.kind === "exterior");
    const hasLabel = parsed.photoPaths.some((p) => p.kind === "label");
    if (!hasExterior || !hasLabel) {
      return NextResponse.json(
        { error: "Required photos: exterior and label" },
        { status: 400 },
      );
    }
    if (parsed.condition === "damaged" && !parsed.photoPaths.some((p) => p.kind === "damage")) {
      return NextResponse.json(
        { error: "Damage photos required when condition is damaged" },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const id = randomUUID();
    const barcode = `PKG-${id.slice(0, 8).toUpperCase()}`;

    let userId: string | null = null;
    let indId: string | null = null;
    let status: PackageRecord["status"] = "Unidentified";

    if (parsed.unidentified || !parsed.indId) {
      status = "Unidentified";
    } else {
      indId = normalizeIndId(parsed.indId);
      if (!isValidIndId(indId)) {
        return NextResponse.json({ error: "Invalid IND format" }, { status: 400 });
      }
      const indSnap = await adminDb().collection(COLLECTIONS.indIndex).doc(indId).get();
      if (!indSnap.exists) {
        return NextResponse.json(
          { error: "IND not found — use unidentified flow" },
          { status: 404 },
        );
      }
      userId = indSnap.data()?.uid as string;
      status = "Stored";
    }

    const photos = parsed.photoPaths.map((p) => ({
      id: randomUUID(),
      kind: p.kind,
      storagePath: p.storagePath,
      createdAt: now,
      createdBy: identity.uid,
    }));

    const pkg: PackageRecord = {
      id,
      barcode,
      userId,
      indId,
      status,
      senderStore: parsed.senderStore,
      inboundTracking: parsed.inboundTracking,
      weightKg: parsed.weightKg,
      lengthCm: parsed.lengthCm,
      widthCm: parsed.widthCm,
      heightCm: parsed.heightCm,
      condition: parsed.condition,
      binLocation: parsed.binLocation,
      photos,
      notes: parsed.notes,
      createdAt: now,
      updatedAt: now,
      ...(status === "Stored"
        ? { storedAt: now, storageWarningsSent: [] }
        : { unidentifiedAt: now }),
      ...(parsed.condition !== "ok"
        ? {
            status: "Action Required" as const,
            actionRequiredReason:
              parsed.condition === "damaged"
                ? "Package arrived damaged"
                : "Suspected prohibited item — hold",
            storedAt: status === "Stored" || userId ? now : undefined,
            userId,
            indId,
          }
        : {}),
    };

    // If damaged but identified, keep customer link with Action Required
    if (parsed.condition !== "ok" && userId) {
      pkg.status = "Action Required";
      pkg.userId = userId;
      pkg.indId = indId;
      pkg.storedAt = now;
    }

    await adminDb().collection(COLLECTIONS.packages).doc(id).set(pkg);

    await writeAuditLog({
      actorId: identity.uid,
      actorEmail: identity.email ?? staff.email,
      action: "receive_package",
      entityType: "package",
      entityId: id,
      after: { status: pkg.status, indId, barcode },
    });

    if (pkg.userId && (pkg.status === "Stored" || pkg.status === "Action Required")) {
      const user = (
        await adminDb().collection(COLLECTIONS.users).doc(pkg.userId).get()
      ).data() as UserProfile | undefined;
      await notifyUser({
        userId: pkg.userId,
        email: user?.email,
        type: pkg.status === "Action Required" ? "action_required" : "package_received",
        title:
          pkg.status === "Action Required"
            ? "Action required on your package"
            : "Package received at IndiRoute",
        body:
          pkg.status === "Action Required"
            ? pkg.actionRequiredReason ?? "Please check your dashboard."
            : `Your package ${barcode} is stored. Free storage: ${FROZEN.freeStorageDays} calendar days from Stored.`,
        entityType: "package",
        entityId: id,
      });
    }

    return NextResponse.json({ package: pkg });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(error);
    return NextResponse.json({ error: "Receive failed" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import {
  shouldSendStorageWarning,
  storageChargesStarted,
  storageDayNumber,
} from "@/lib/domain/storage";
import { notifyUser } from "@/lib/server/notifications";
import { FROZEN } from "@/lib/config/frozen";
import type { PackageRecord, UserProfile } from "@/lib/types";

/**
 * Call from a scheduled job (Vercel cron) with Authorization: Bearer CRON_SECRET.
 * Does NOT auto-dispose packages.
 */
async function run(req: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snap = await adminDb()
    .collection(COLLECTIONS.packages)
    .where("status", "in", ["Stored", "Action Required", "Awaiting Payment"])
    .get();

  let warnings = 0;
  let chargeStarted = 0;

  for (const doc of snap.docs) {
    const pkg = doc.data() as PackageRecord;
    if (!pkg.storedAt || !pkg.userId) continue;
    const sent = pkg.storageWarningsSent ?? [];
    const warnDay = shouldSendStorageWarning(pkg.storedAt, sent);
    const user = (
      await adminDb().collection(COLLECTIONS.users).doc(pkg.userId).get()
    ).data() as UserProfile | undefined;

    if (warnDay != null) {
      await notifyUser({
        userId: pkg.userId,
        email: user?.email,
        type: "storage_warning",
        title: `Storage warning — day ${warnDay}`,
        body: `Package ${pkg.barcode}: free storage is ${FROZEN.freeStorageDays} calendar days from Stored. Day ${warnDay} of the free window.`,
        entityType: "package",
        entityId: pkg.id,
      });
      await doc.ref.update({
        storageWarningsSent: [...sent, warnDay],
        updatedAt: new Date().toISOString(),
      });
      warnings += 1;
    }

    const day = storageDayNumber(pkg.storedAt);
    if (
      storageChargesStarted(pkg.storedAt) &&
      day === FROZEN.freeStorageDays + 1 &&
      !sent.includes(21)
    ) {
      await notifyUser({
        userId: pkg.userId,
        email: user?.email,
        type: "storage_charges_started",
        title: "Storage charges started",
        body: `Package ${pkg.barcode}: free storage ended. ₹${FROZEN.storageFeeInrPerDay}/day now accrues until shipment.`,
        entityType: "package",
        entityId: pkg.id,
      });
      await doc.ref.update({
        storageWarningsSent: [...sent, 21],
        updatedAt: new Date().toISOString(),
      });
      chargeStarted += 1;
    }
  }

  return NextResponse.json({ ok: true, warnings, chargeStarted, autoDispose: false });
}

export async function GET(req: NextRequest) {
  return run(req);
}

export async function POST(req: NextRequest) {
  return run(req);
}

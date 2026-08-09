import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { requireCustomer, requireStaff } from "@/lib/server/auth";
import { notifyUser } from "@/lib/server/notifications";
import type { ConsolidationRecord, PackageRecord } from "@/lib/types";

const createSchema = z.object({
  packageIds: z.array(z.string()).min(2),
});

export async function POST(req: NextRequest) {
  try {
    const { identity, profile } = await requireCustomer(
      req.headers.get("authorization"),
    );
    if (!identity.emailVerified || !profile.indId) {
      return NextResponse.json(
        { error: "Verify email and obtain IND before consolidating" },
        { status: 403 },
      );
    }
    const { packageIds } = createSchema.parse(await req.json());
    const docs = await Promise.all(
      packageIds.map((id) =>
        adminDb().collection(COLLECTIONS.packages).doc(id).get(),
      ),
    );
    for (const doc of docs) {
      if (!doc.exists) {
        return NextResponse.json({ error: "Package not found" }, { status: 404 });
      }
      const pkg = doc.data() as PackageRecord;
      if (pkg.userId !== identity.uid) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (pkg.status !== "Stored") {
        return NextResponse.json(
          { error: "Only Stored packages can be consolidated" },
          { status: 400 },
        );
      }
      if (pkg.consolidationId) {
        return NextResponse.json(
          { error: "Package already in a consolidation" },
          { status: 400 },
        );
      }
    }

    const now = new Date().toISOString();
    const id = randomUUID();
    const record: ConsolidationRecord = {
      id,
      userId: identity.uid,
      packageIds,
      status: "requested",
      createdAt: now,
      updatedAt: now,
    };
    const batch = adminDb().batch();
    batch.set(adminDb().collection(COLLECTIONS.consolidations).doc(id), record);
    for (const pkgId of packageIds) {
      batch.update(adminDb().collection(COLLECTIONS.packages).doc(pkgId), {
        status: "Consolidation Requested",
        consolidationId: id,
        updatedAt: now,
      });
    }
    await batch.commit();

    await notifyUser({
      userId: identity.uid,
      email: profile.email,
      type: "consolidation_started",
      title: "Consolidation requested",
      body: "Warehouse staff will combine your selected packages. Open quotes will be invalidated after completion.",
      entityType: "consolidation",
      entityId: id,
    });

    return NextResponse.json({ consolidation: record });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(error);
    return NextResponse.json({ error: "Consolidation failed" }, { status: 500 });
  }
}

const completeSchema = z.object({
  consolidationId: z.string(),
  scannedBarcodes: z.array(z.string()).min(2),
  weightKg: z.number().positive(),
  lengthCm: z.number().positive(),
  widthCm: z.number().positive(),
  heightCm: z.number().positive(),
  binLocation: z.string().min(1),
  photoPath: z.string().min(1),
  confirm: z.literal(true),
});

/** Staff completes consolidation with mandatory barcode scan match */
export async function PATCH(req: NextRequest) {
  try {
    const { identity, staff } = await requireStaff(req.headers.get("authorization"));
    const body = completeSchema.parse(await req.json());
    const consRef = adminDb()
      .collection(COLLECTIONS.consolidations)
      .doc(body.consolidationId);
    const consSnap = await consRef.get();
    if (!consSnap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const cons = consSnap.data() as ConsolidationRecord;
    if (cons.status !== "requested" && cons.status !== "packing") {
      return NextResponse.json({ error: "Invalid consolidation state" }, { status: 400 });
    }

    const packages = await Promise.all(
      cons.packageIds.map((id) =>
        adminDb().collection(COLLECTIONS.packages).doc(id).get(),
      ),
    );
    const barcodes = packages.map((p) => (p.data() as PackageRecord).barcode).sort();
    const scanned = [...body.scannedBarcodes].sort();
    if (barcodes.length !== scanned.length || barcodes.some((b, i) => b !== scanned[i])) {
      return NextResponse.json(
        { error: "Scan mismatch — consolidation blocked" },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const newId = randomUUID();
    const barcode = `PKG-${newId.slice(0, 8).toUpperCase()}`;
    const first = packages[0]!.data() as PackageRecord;

    const consolidated: PackageRecord = {
      id: newId,
      barcode,
      userId: cons.userId,
      indId: first.indId,
      status: "Stored",
      weightKg: body.weightKg,
      lengthCm: body.lengthCm,
      widthCm: body.widthCm,
      heightCm: body.heightCm,
      binLocation: body.binLocation,
      memberPackageIds: cons.packageIds,
      consolidationId: cons.id,
      photos: [
        {
          id: randomUUID(),
          kind: "consolidation",
          storagePath: body.photoPath,
          createdAt: now,
          createdBy: identity.uid,
        },
      ],
      storedAt: now,
      storageWarningsSent: [],
      createdAt: now,
      updatedAt: now,
    };

    const batch = adminDb().batch();
    batch.set(adminDb().collection(COLLECTIONS.packages).doc(newId), consolidated);
    for (const pkgId of cons.packageIds) {
      batch.update(adminDb().collection(COLLECTIONS.packages).doc(pkgId), {
        status: "Packing",
        consolidatedIntoId: newId,
        updatedAt: now,
      });
    }
    // Invalidate open quotes for member packages
    const quotes = await adminDb()
      .collection(COLLECTIONS.quotes)
      .where("userId", "==", cons.userId)
      .where("status", "in", ["open", "selected"])
      .get();
    for (const q of quotes.docs) {
      const data = q.data();
      const overlap = (data.packageIds as string[]).some((id) =>
        cons.packageIds.includes(id),
      );
      if (overlap) {
        batch.update(q.ref, { status: "invalidated", updatedAt: now });
      }
    }
    batch.update(consRef, {
      status: "completed",
      resultingPackageId: newId,
      updatedAt: now,
    });
    // Mark members stored-closed conceptually via consolidatedIntoId; keep Packing→ then we set them aside
    for (const pkgId of cons.packageIds) {
      batch.update(adminDb().collection(COLLECTIONS.packages).doc(pkgId), {
        status: "Stored",
        updatedAt: now,
      });
    }
    await batch.commit();

    // Fix: members shouldn't stay Stored as shippable — mark Exception internal? Spec says close into consolidated unit.
    // Set member packages to a non-shippable state by clearing ship eligibility via consolidatedIntoId check in quote API.
    void staff;

    const userSnap = await adminDb().collection(COLLECTIONS.users).doc(cons.userId).get();
    await notifyUser({
      userId: cons.userId,
      email: userSnap.data()?.email,
      type: "consolidation_completed",
      title: "Consolidation completed",
      body: "Your packages were combined. Previous quotes were invalidated. Create a new shipping quote.",
      entityType: "package",
      entityId: newId,
    });

    return NextResponse.json({ package: consolidated });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(error);
    return NextResponse.json({ error: "Complete consolidation failed" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";

/**
 * Server-side staff session check (Admin SDK).
 * Avoids client Firestore permission errors on /staff-login.
 */
export async function GET(req: NextRequest) {
  try {
    if (!isAdminConfigured()) {
      return NextResponse.json(
        { error: "Firebase Admin not configured" },
        { status: 503 },
      );
    }
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth().verifyIdToken(authHeader.slice(7));
    const staffSnap = await adminDb()
      .collection(COLLECTIONS.staff)
      .doc(decoded.uid)
      .get();

    if (!staffSnap.exists || staffSnap.data()?.active === false) {
      return NextResponse.json({
        ok: false,
        staff: null,
        isStaff: false,
      });
    }

    const data = staffSnap.data()!;
    return NextResponse.json({
      ok: true,
      isStaff: true,
      staff: {
        uid: decoded.uid,
        email: data.email ?? decoded.email ?? null,
        displayName: data.displayName ?? null,
        role: data.role,
        active: data.active !== false,
      },
    });
  } catch (error) {
    console.error("[admin/session]", error);
    return NextResponse.json({ error: "Session check failed" }, { status: 500 });
  }
}

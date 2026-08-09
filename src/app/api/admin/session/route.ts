import { NextRequest, NextResponse } from "next/server";
import {
  adminAuth,
  adminDb,
  getAdminInitError,
  isAdminConfigured,
} from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { ensureFounderAdmin } from "@/lib/auth/ensureFounderAdmin";

export const runtime = "nodejs";

/**
 * Server-side staff session check (Admin SDK).
 * Auto-heals the founder admin staff doc when email matches ADMIN_EMAIL.
 */
export async function GET(req: NextRequest) {
  try {
    if (!isAdminConfigured()) {
      return NextResponse.json(
        {
          error: "Firebase Admin not configured on this server",
          isStaff: false,
        },
        { status: 503 },
      );
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized", isStaff: false },
        { status: 401 },
      );
    }

    let decoded;
    try {
      decoded = await adminAuth().verifyIdToken(authHeader.slice(7));
    } catch (err) {
      console.error("[admin/session] verifyIdToken", err);
      return NextResponse.json(
        {
          error: "Invalid auth token",
          isStaff: false,
          detail: getAdminInitError(),
        },
        { status: 401 },
      );
    }

    const founderEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const tokenEmail = (decoded.email || "").trim().toLowerCase();

    let staffSnap = await adminDb()
      .collection(COLLECTIONS.staff)
      .doc(decoded.uid)
      .get();

    if (
      founderEmail &&
      tokenEmail === founderEmail &&
      (!staffSnap.exists || staffSnap.data()?.active === false)
    ) {
      console.warn("[admin/session] healing founder staff doc", {
        uid: decoded.uid,
        email: tokenEmail,
      });
      await ensureFounderAdmin();
      staffSnap = await adminDb()
        .collection(COLLECTIONS.staff)
        .doc(decoded.uid)
        .get();
    }

    if (!staffSnap.exists || staffSnap.data()?.active === false) {
      return NextResponse.json({
        ok: false,
        staff: null,
        isStaff: false,
        email: tokenEmail || null,
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
    const message = error instanceof Error ? error.message : "Session check failed";
    console.error("[admin/session]", error);
    return NextResponse.json(
      {
        error: message,
        isStaff: false,
        detail: getAdminInitError(),
      },
      { status: 500 },
    );
  }
}

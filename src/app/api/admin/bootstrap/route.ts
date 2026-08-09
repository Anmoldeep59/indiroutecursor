import { NextResponse } from "next/server";
import { ensureFounderAdmin } from "@/lib/auth/ensureFounderAdmin";
import { getAdminInitError, isAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";

/**
 * Idempotent: creates/updates the single founder admin from ADMIN_EMAIL / ADMIN_PASSWORD.
 * Does not return the password. Safe to call from staff-login.
 */
export async function POST() {
  try {
    if (!isAdminConfigured()) {
      return NextResponse.json(
        {
          error:
            "Firebase Admin not configured. Set FIREBASE_ADMIN_* env vars on the host (Vercel).",
        },
        { status: 503 },
      );
    }
    const result = await ensureFounderAdmin();
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, detail: getAdminInitError() },
        { status: result.error?.includes("not configured") ? 503 : 400 },
      );
    }
    return NextResponse.json({
      ok: true,
      email: result.email,
      created: result.created,
      message: result.created
        ? "Founder admin created"
        : "Founder admin ready",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bootstrap failed";
    console.error("[admin/bootstrap]", error);
    return NextResponse.json(
      { error: message, detail: getAdminInitError() },
      { status: 500 },
    );
  }
}

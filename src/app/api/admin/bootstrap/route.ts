import { NextResponse } from "next/server";
import { ensureFounderAdmin } from "@/lib/auth/ensureFounderAdmin";

/**
 * Idempotent: creates/updates the single founder admin from ADMIN_EMAIL / ADMIN_PASSWORD.
 * Does not return the password. Safe to call from staff-login.
 */
export async function POST() {
  try {
    const result = await ensureFounderAdmin();
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
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
    console.error("[admin/bootstrap]", error);
    return NextResponse.json({ error: "Bootstrap failed" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import { confirmEmailOtp } from "@/lib/auth/emailVerification";

export const runtime = "nodejs";

/**
 * Confirm Resend OTP for the signed-in email/password user.
 * Sets Firebase emailVerified via Admin SDK and issues IND once.
 */
export async function POST(req: NextRequest) {
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
    const provider = decoded.firebase?.sign_in_provider;
    if (provider === "google.com") {
      return NextResponse.json({
        ok: true,
        skipped: true,
        message: "Google accounts are verified by Google",
      });
    }

    const body = (await req.json().catch(() => ({}))) as { code?: string };
    const result = await confirmEmailOtp({
      uid: decoded.uid,
      code: body.code || "",
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({
      ok: true,
      uid: result.uid,
      indId: result.indId,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("[confirm-otp] failed", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

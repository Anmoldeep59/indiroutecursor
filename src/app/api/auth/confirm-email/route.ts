import { NextRequest, NextResponse } from "next/server";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { confirmEmailVerificationToken } from "@/lib/auth/emailVerification";

/**
 * Confirms email using the one-time token from the Resend link.
 * Token is the only secret — never trust email query params.
 */
export async function POST(req: NextRequest) {
  try {
    if (!isAdminConfigured()) {
      return NextResponse.json(
        { error: "Firebase Admin not configured" },
        { status: 503 },
      );
    }

    const body = (await req.json().catch(() => ({}))) as { token?: string };
    const token = body.token?.trim();
    if (!token) {
      return NextResponse.json({ error: "Missing verification token" }, { status: 400 });
    }

    // Reject attempts to "verify by email" without token
    if ("email" in body && !token) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const result = await confirmEmailVerificationToken(token);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      ok: true,
      uid: result.uid,
      indId: result.indId,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("[confirm-email] failed", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

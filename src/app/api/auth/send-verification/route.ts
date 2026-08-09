import { NextRequest, NextResponse } from "next/server";
import { adminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import { sendCustomVerificationEmail } from "@/lib/auth/emailVerification";

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
    const body = (await req.json().catch(() => ({}))) as { displayName?: string };

    if (decoded.email_verified) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        message: "Email is already verified",
      });
    }

    if (!decoded.email) {
      return NextResponse.json({ error: "Account has no email" }, { status: 400 });
    }

    // Never send Resend verify for Google (or other already-verified providers)
    const provider = decoded.firebase?.sign_in_provider;
    if (provider && provider !== "password" && provider !== "custom") {
      // If Firebase says unverified but provider isn't password, still allow send
      // only for password. Google should already be verified.
      if (provider === "google.com") {
        return NextResponse.json({
          ok: true,
          skipped: true,
          message: "Google accounts are verified by Google",
        });
      }
    }

    const result = await sendCustomVerificationEmail({
      uid: decoded.uid,
      email: decoded.email,
      displayName: body.displayName || decoded.name || "",
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, cooldownSeconds: result.cooldownSeconds },
        { status: result.status },
      );
    }

    return NextResponse.json({
      ok: true,
      skipped: result.skipped ?? false,
      message: result.skipped
        ? "Email already verified"
        : "Verification email sent. Check your inbox and spam folder.",
    });
  } catch (error) {
    console.error("[send-verification] failed", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 },
    );
  }
}

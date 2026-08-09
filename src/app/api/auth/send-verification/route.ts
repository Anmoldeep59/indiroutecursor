import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
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

    // Staff / founder admin — never send customer verification emails
    const staffSnap = await adminDb()
      .collection(COLLECTIONS.staff)
      .doc(decoded.uid)
      .get();
    if (staffSnap.exists && staffSnap.data()?.active !== false) {
      if (!decoded.email_verified) {
        await adminAuth().updateUser(decoded.uid, { emailVerified: true });
      }
      return NextResponse.json({
        ok: true,
        skipped: true,
        message: "Staff accounts do not require email verification",
      });
    }

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

    // Never send Resend verify for Google
    const provider = decoded.firebase?.sign_in_provider;
    if (provider === "google.com") {
      return NextResponse.json({
        ok: true,
        skipped: true,
        message: "Google accounts are verified by Google",
      });
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

    const payload: Record<string, unknown> = {
      ok: true,
      skipped: result.skipped ?? false,
      message: result.skipped
        ? "Email already verified"
        : "Verification code sent via Resend. Enter the 6-digit OTP to continue.",
      provider: "resend",
    };
    // Surface Resend message ID in development for delivery proof
    if (process.env.NODE_ENV === "development" && result.messageId) {
      payload.messageId = result.messageId;
      console.info("[send-verification] Resend message ID", result.messageId);
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[send-verification] failed", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 },
    );
  }
}

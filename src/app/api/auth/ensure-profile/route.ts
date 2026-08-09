import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { issueIndOnce } from "@/lib/auth/issueInd";
import { notifyUser } from "@/lib/server/notifications";
import type { UserProfile } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    if (!isAdminConfigured()) {
      console.error("[ensure-profile] Firebase Admin not configured");
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
    const body = (await req.json().catch(() => ({}))) as {
      displayName?: string;
      sendVerification?: boolean;
    };
    const now = new Date().toISOString();
    const ref = adminDb().collection(COLLECTIONS.users).doc(decoded.uid);
    const existing = await ref.get();

    // Staff / founder admin: force verified, never require Resend OTP
    const staffSnap = await adminDb()
      .collection(COLLECTIONS.staff)
      .doc(decoded.uid)
      .get();
    const isStaff = staffSnap.exists && staffSnap.data()?.active !== false;
    if (isStaff && !decoded.email_verified) {
      await adminAuth().updateUser(decoded.uid, { emailVerified: true });
    }
    const emailVerified = Boolean(decoded.email_verified || isStaff);

    if (!existing.exists) {
      const profile: UserProfile = {
        uid: decoded.uid,
        email: decoded.email ?? "",
        displayName: body.displayName || decoded.name || "",
        emailVerified,
        indId: null,
        createdAt: now,
        updatedAt: now,
        role: "customer",
      };
      await ref.set(profile);
      if (decoded.email && !emailVerified) {
        try {
          await notifyUser({
            userId: decoded.uid,
            email: decoded.email,
            type: "welcome",
            title: "Welcome to IndiRoute",
            body: "Verify your email to receive your permanent IND ID and India warehouse address.",
            sendEmail: false,
          });
        } catch (err) {
          console.error("[ensure-profile] welcome notification failed", err);
        }
      }
    } else {
      await ref.set(
        {
          email: decoded.email ?? existing.data()?.email,
          emailVerified,
          displayName:
            body.displayName ||
            existing.data()?.displayName ||
            decoded.name ||
            "",
          updatedAt: now,
        },
        { merge: true },
      );
    }

    // Google / already-verified providers: issue IND, never send Resend verify
    if (emailVerified) {
      await issueIndOnce(decoded.uid);
    }

    const final = (await ref.get()).data() as UserProfile;
    console.info("[ensure-profile]", {
      uid: decoded.uid,
      emailVerified,
      indId: final?.indId ?? null,
      provider: decoded.firebase?.sign_in_provider ?? "unknown",
    });
    return NextResponse.json({ profile: final });
  } catch (error) {
    console.error("[ensure-profile] failed", error);
    return NextResponse.json({ error: "Failed to ensure profile" }, { status: 500 });
  }
}

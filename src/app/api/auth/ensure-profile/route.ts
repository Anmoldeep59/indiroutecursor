import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { generateIndId } from "@/lib/domain/ind";
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

    // checkRevoked false; token must include fresh email_verified after client getIdToken(true)
    const decoded = await adminAuth().verifyIdToken(authHeader.slice(7));
    const body = (await req.json().catch(() => ({}))) as { displayName?: string };
    const now = new Date().toISOString();
    const ref = adminDb().collection(COLLECTIONS.users).doc(decoded.uid);
    const existing = await ref.get();
    const emailVerified = Boolean(decoded.email_verified);

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
      if (decoded.email) {
        try {
          await notifyUser({
            userId: decoded.uid,
            email: decoded.email,
            type: "welcome",
            title: "Welcome to IndiRoute",
            body: "Verify your email to receive your permanent IND ID and India warehouse address.",
            // Firebase Auth owns verification email; Resend welcome is optional
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

    // Issue IND exactly once after verification — transactional & idempotent
    if (emailVerified) {
      await adminDb().runTransaction(async (tx) => {
        const userSnap = await tx.get(ref);
        const data = userSnap.data() as UserProfile | undefined;
        if (!data) return;
        if (data.indId) {
          tx.set(ref, { emailVerified: true, updatedAt: now }, { merge: true });
          return;
        }

        let indId = generateIndId();
        for (let attempt = 0; attempt < 8; attempt++) {
          const indRef = adminDb().collection(COLLECTIONS.indIndex).doc(indId);
          const taken = await tx.get(indRef);
          if (!taken.exists) {
            tx.set(indRef, {
              uid: decoded.uid,
              createdAt: now,
              permanent: true,
              recycled: false,
            });
            tx.set(
              ref,
              {
                indId,
                emailVerified: true,
                updatedAt: now,
                indIssuedAt: now,
              },
              { merge: true },
            );
            return;
          }
          indId = generateIndId();
        }
        throw new Error("Could not allocate unique IND ID");
      });
    }

    const final = (await ref.get()).data() as UserProfile;
    console.info("[ensure-profile]", {
      uid: decoded.uid,
      emailVerified,
      indId: final?.indId ?? null,
    });
    return NextResponse.json({ profile: final });
  } catch (error) {
    console.error("[ensure-profile] failed", error);
    return NextResponse.json({ error: "Failed to ensure profile" }, { status: 500 });
  }
}

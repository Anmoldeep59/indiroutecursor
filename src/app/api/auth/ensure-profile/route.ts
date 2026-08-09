import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { generateIndId } from "@/lib/domain/ind";
import { notifyUser } from "@/lib/server/notifications";
import type { UserProfile } from "@/lib/types";

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
    const now = new Date().toISOString();
    const ref = adminDb().collection(COLLECTIONS.users).doc(decoded.uid);
    const existing = await ref.get();

    if (!existing.exists) {
      const profile: UserProfile = {
        uid: decoded.uid,
        email: decoded.email ?? "",
        displayName: body.displayName || decoded.name || "",
        emailVerified: Boolean(decoded.email_verified),
        indId: null,
        createdAt: now,
        updatedAt: now,
        role: "customer",
      };
      await ref.set(profile);
      if (decoded.email) {
        await notifyUser({
          userId: decoded.uid,
          email: decoded.email,
          type: "welcome",
          title: "Welcome to IndiRoute",
          body: "Verify your email to receive your permanent IND ID and India warehouse address.",
        });
      }
    } else {
      await ref.set(
        {
          email: decoded.email ?? existing.data()?.email,
          emailVerified: Boolean(decoded.email_verified),
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

    // Issue IND only after email verification — never recycle
    const fresh = await ref.get();
    const profile = fresh.data() as UserProfile;
    if (decoded.email_verified && !profile.indId) {
      let indId = generateIndId();
      let attempts = 0;
      while (attempts < 5) {
        const indRef = adminDb().collection(COLLECTIONS.indIndex).doc(indId);
        const taken = await indRef.get();
        if (!taken.exists) {
          await adminDb().runTransaction(async (tx) => {
            const again = await tx.get(indRef);
            if (again.exists) throw new Error("collision");
            tx.set(indRef, {
              uid: decoded.uid,
              createdAt: now,
              permanent: true,
              recycled: false,
            });
            tx.set(
              ref,
              { indId, emailVerified: true, updatedAt: now },
              { merge: true },
            );
          });
          break;
        }
        indId = generateIndId();
        attempts += 1;
      }
    } else if (decoded.email_verified && profile.indId) {
      await ref.set({ emailVerified: true, updatedAt: now }, { merge: true });
    }

    const final = (await ref.get()).data() as UserProfile;
    return NextResponse.json({ profile: final });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to ensure profile" }, { status: 500 });
  }
}

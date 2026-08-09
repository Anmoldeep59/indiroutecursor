import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { generateIndId } from "@/lib/domain/ind";
import type { UserProfile } from "@/lib/types";

/** Issue permanent IND-XXXXXX exactly once for a verified user. Idempotent. */
export async function issueIndOnce(uid: string): Promise<string | null> {
  const db = adminDb();
  const ref = db.collection(COLLECTIONS.users).doc(uid);
  const now = new Date().toISOString();

  await db.runTransaction(async (tx) => {
    const userSnap = await tx.get(ref);
    const data = userSnap.data() as UserProfile | undefined;
    if (!data) {
      tx.set(
        ref,
        {
          uid,
          emailVerified: true,
          indId: null,
          updatedAt: now,
          role: "customer",
          createdAt: now,
        },
        { merge: true },
      );
      return;
    }
    if (data.indId) {
      tx.set(ref, { emailVerified: true, updatedAt: now }, { merge: true });
      return;
    }

    let indId = generateIndId();
    for (let attempt = 0; attempt < 8; attempt++) {
      const indRef = db.collection(COLLECTIONS.indIndex).doc(indId);
      const taken = await tx.get(indRef);
      if (!taken.exists) {
        tx.set(indRef, {
          uid,
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

  const final = (await ref.get()).data() as UserProfile | undefined;
  return final?.indId ?? null;
}

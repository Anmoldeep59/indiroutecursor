import { adminAuth, adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";

export type FounderAdminResult = {
  ok: boolean;
  uid?: string;
  email?: string;
  created?: boolean;
  passwordSynced?: boolean;
  error?: string;
};

/**
 * Single Beta founder admin from server env — always emailVerified, no Resend.
 * Password is set on create only. To reset password from env, set ADMIN_SYNC_PASSWORD=true
 * (or run scripts/sync-founder-admin.mjs). Bootstrap must not overwrite a working password
 * with a stale Next.js env value on every /staff-login load.
 */
export async function ensureFounderAdmin(): Promise<FounderAdminResult> {
  if (!isAdminConfigured()) {
    return { ok: false, error: "Firebase Admin not configured" };
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const displayName =
    process.env.ADMIN_DISPLAY_NAME?.trim() || "IndiRoute Admin";
  const syncPassword =
    process.env.ADMIN_SYNC_PASSWORD === "1" ||
    process.env.ADMIN_SYNC_PASSWORD === "true";

  if (!email || !password) {
    return {
      ok: false,
      error: "ADMIN_EMAIL and ADMIN_PASSWORD must be set in server env",
    };
  }
  if (password.length < 8) {
    return { ok: false, error: "ADMIN_PASSWORD must be at least 8 characters" };
  }

  const now = new Date().toISOString();
  let uid: string;
  let created = false;
  let passwordSynced = false;

  try {
    const existing = await adminAuth().getUserByEmail(email);
    uid = existing.uid;
    const patch: {
      emailVerified: boolean;
      displayName: string;
      disabled: boolean;
      password?: string;
    } = {
      emailVerified: true,
      displayName,
      disabled: false,
    };
    if (syncPassword) {
      patch.password = password;
      passwordSynced = true;
    }
    await adminAuth().updateUser(uid, patch);
  } catch (err) {
    const code =
      typeof err === "object" && err && "code" in err
        ? String((err as { code?: string }).code)
        : "";
    if (code !== "auth/user-not-found") {
      console.error("[ensureFounderAdmin] lookup/update failed", err);
      return { ok: false, error: "Could not ensure admin auth user" };
    }
    const createdUser = await adminAuth().createUser({
      email,
      password,
      emailVerified: true,
      displayName,
      disabled: false,
    });
    uid = createdUser.uid;
    created = true;
    passwordSynced = true;
  }

  await adminDb()
    .collection(COLLECTIONS.staff)
    .doc(uid)
    .set(
      {
        uid,
        email,
        displayName,
        role: "super_admin",
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );

  await adminDb()
    .collection(COLLECTIONS.users)
    .doc(uid)
    .set(
      {
        uid,
        email,
        displayName,
        emailVerified: true,
        indId: null,
        role: "customer",
        createdAt: now,
        updatedAt: now,
        isStaffAdmin: true,
      },
      { merge: true },
    );

  console.info("[ensureFounderAdmin]", {
    uid,
    email,
    created,
    passwordSynced,
  });
  return { ok: true, uid, email, created, passwordSynced };
}

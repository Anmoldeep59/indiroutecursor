import { createHash, randomBytes } from "crypto";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { absoluteAppUrl } from "@/lib/auth/appUrl";
import {
  emailShell,
  sendTransactionalEmail,
} from "@/lib/email/resend";
import { issueIndOnce } from "@/lib/auth/issueInd";

export const VERIFY_TOKEN_TTL_MS = 60 * 60 * 1000; // 60 minutes
export const VERIFY_RESEND_COOLDOWN_MS = 60_000;
export const VERIFY_MAX_SENDS_PER_HOUR = 5;

type TokenDoc = {
  id: string;
  uid: string;
  email: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  revokedAt: string | null;
};

type VerifyMeta = {
  lastSentAt?: string;
  hourWindowStart?: string;
  sendsInWindow?: number;
};

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

function newRawToken(): string {
  return randomBytes(32).toString("base64url");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function revokeOutstandingTokens(uid: string): Promise<void> {
  const db = adminDb();
  const snap = await db
    .collection(COLLECTIONS.emailVerificationTokens)
    .where("uid", "==", uid)
    .limit(40)
    .get();
  const now = new Date().toISOString();
  const batch = db.batch();
  let ops = 0;
  for (const doc of snap.docs) {
    const d = doc.data() as TokenDoc;
    if (!d.usedAt && !d.revokedAt) {
      batch.set(doc.ref, { revokedAt: now }, { merge: true });
      ops++;
    }
  }
  if (ops > 0) await batch.commit();
}

async function checkRateLimit(
  uid: string,
): Promise<{ ok: true } | { ok: false; error: string; cooldownSeconds?: number }> {
  const userRef = adminDb().collection(COLLECTIONS.users).doc(uid);
  const snap = await userRef.get();
  const meta = (snap.data()?.emailVerification as VerifyMeta | undefined) || {};
  const now = Date.now();

  if (meta.lastSentAt) {
    const last = new Date(meta.lastSentAt).getTime();
    if (now - last < VERIFY_RESEND_COOLDOWN_MS) {
      const cooldownSeconds = Math.ceil(
        (VERIFY_RESEND_COOLDOWN_MS - (now - last)) / 1000,
      );
      return {
        ok: false,
        error: `Resend available in ${cooldownSeconds} seconds`,
        cooldownSeconds,
      };
    }
  }

  let windowStart = meta.hourWindowStart
    ? new Date(meta.hourWindowStart).getTime()
    : 0;
  let sends = meta.sendsInWindow ?? 0;
  if (!windowStart || now - windowStart > 60 * 60 * 1000) {
    windowStart = now;
    sends = 0;
  }
  if (sends >= VERIFY_MAX_SENDS_PER_HOUR) {
    return {
      ok: false,
      error: "Too many verification emails. Try again in about an hour.",
    };
  }
  return { ok: true };
}

async function bumpRateLimit(uid: string): Promise<void> {
  const userRef = adminDb().collection(COLLECTIONS.users).doc(uid);
  const snap = await userRef.get();
  const meta = (snap.data()?.emailVerification as VerifyMeta | undefined) || {};
  const now = Date.now();
  let windowStart = meta.hourWindowStart
    ? new Date(meta.hourWindowStart).getTime()
    : now;
  let sends = meta.sendsInWindow ?? 0;
  if (now - windowStart > 60 * 60 * 1000) {
    windowStart = now;
    sends = 0;
  }
  await userRef.set(
    {
      emailVerification: {
        lastSentAt: new Date(now).toISOString(),
        hourWindowStart: new Date(windowStart).toISOString(),
        sendsInWindow: sends + 1,
      },
      updatedAt: new Date(now).toISOString(),
    },
    { merge: true },
  );
}

export type SendVerificationResult =
  | { ok: true; skipped?: boolean; messageId?: string | null }
  | { ok: false; error: string; status: number; cooldownSeconds?: number };

/**
 * Create a one-time token and send Resend verification email.
 * Skips when Firebase already reports emailVerified (e.g. Google).
 */
export async function sendCustomVerificationEmail(input: {
  uid: string;
  email: string;
  displayName?: string;
}): Promise<SendVerificationResult> {
  const email = input.email.trim().toLowerCase();
  if (!email) {
    return { ok: false, error: "Email required", status: 400 };
  }

  const authUser = await adminAuth().getUser(input.uid);
  if (authUser.emailVerified) {
    console.info("[verify-email] skip send — already verified", input.uid);
    await issueIndOnce(input.uid);
    return { ok: true, skipped: true };
  }

  const rate = await checkRateLimit(input.uid);
  if (!rate.ok) {
    return {
      ok: false,
      error: rate.error,
      status: 429,
      cooldownSeconds: rate.cooldownSeconds,
    };
  }

  await revokeOutstandingTokens(input.uid);

  const raw = newRawToken();
  const tokenHash = hashToken(raw);
  const now = new Date();
  const expires = new Date(now.getTime() + VERIFY_TOKEN_TTL_MS);
  const id = randomBytes(16).toString("hex");
  const doc: TokenDoc = {
    id,
    uid: input.uid,
    email,
    tokenHash,
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    usedAt: null,
    revokedAt: null,
  };
  await adminDb()
    .collection(COLLECTIONS.emailVerificationTokens)
    .doc(id)
    .set(doc);

  const verifyUrl = absoluteAppUrl(
    `/verify-email?token=${encodeURIComponent(raw)}`,
  );
  const name = input.displayName?.trim() || "there";
  const minutes = Math.round(VERIFY_TOKEN_TTL_MS / 60000);

  const html = emailShell(
    "Verify your IndiRoute email",
    `<p>Welcome to IndiRoute, ${escapeHtml(name)}.</p>
     <p>Verify your email address to activate your IndiRoute account and receive your personal India warehouse address.</p>
     <p style="margin:28px 0">
       <a href="${verifyUrl}" style="display:inline-block;background:#ff671f;color:#0a1b30;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:4px">
         Verify Email
       </a>
     </p>
     <p style="font-size:13px;color:#5c6f68">This link expires in ${minutes} minutes and can be used once.</p>
     <p style="font-size:13px;color:#5c6f68">If you did not create an IndiRoute account, you can ignore this email.</p>
     <p style="font-size:12px;word-break:break-all;color:#8a93a3">Or paste this URL:<br/>${escapeHtml(verifyUrl)}</p>`,
  );

  if (!process.env.RESEND_API_KEY) {
    console.error("[verify-email] RESEND_API_KEY missing — cannot send");
    return {
      ok: false,
      error:
        "Email delivery is not configured (RESEND_API_KEY). Add it to server env and retry.",
      status: 503,
    };
  }

  const sent = await sendTransactionalEmail({
    to: email,
    event: "verify_email",
    subject: "Verify your IndiRoute email",
    html,
  });

  if (!sent.ok || sent.skipped || !sent.id) {
    console.error("[verify-email] Resend failed — not falling back to Firebase", {
      uid: input.uid,
      email,
      skipped: sent.skipped,
      error: sent.error,
    });
    return {
      ok: false,
      error:
        sent.error ||
        "Could not send verification email via Resend. Try again shortly.",
      status: sent.skipped ? 503 : 502,
    };
  }

  await bumpRateLimit(input.uid);

  console.info("[verify-email] Resend sent", {
    uid: input.uid,
    email,
    messageId: sent.id,
  });

  return { ok: true, messageId: sent.id };
}

export type ConfirmVerificationResult =
  | { ok: true; uid: string; indId: string | null }
  | { ok: false; error: string; status: number };

/** Validate one-time token and mark Firebase email verified + issue IND. */
export async function confirmEmailVerificationToken(
  rawToken: string,
): Promise<ConfirmVerificationResult> {
  const token = rawToken?.trim();
  if (!token || token.length < 20) {
    return { ok: false, error: "Invalid verification link", status: 400 };
  }

  const tokenHash = hashToken(token);
  const db = adminDb();
  const snap = await db
    .collection(COLLECTIONS.emailVerificationTokens)
    .where("tokenHash", "==", tokenHash)
    .limit(1)
    .get();

  if (snap.empty) {
    return { ok: false, error: "Invalid or unknown verification link", status: 400 };
  }

  const ref = snap.docs[0]!.ref;
  const data = snap.docs[0]!.data() as TokenDoc;

  if (data.usedAt) {
    return { ok: false, error: "This verification link was already used", status: 410 };
  }
  if (data.revokedAt) {
    return {
      ok: false,
      error: "This verification link was replaced. Request a new email.",
      status: 410,
    };
  }
  if (new Date(data.expiresAt).getTime() < Date.now()) {
    return {
      ok: false,
      error: "This verification link has expired. Request a new email.",
      status: 410,
    };
  }

  const authUser = await adminAuth().getUser(data.uid);
  const authEmail = (authUser.email || "").toLowerCase();
  if (!authEmail || authEmail !== data.email.toLowerCase()) {
    console.error("[verify-email] email mismatch", {
      uid: data.uid,
      tokenEmail: data.email,
      authEmail,
    });
    return {
      ok: false,
      error: "Verification link does not match this account",
      status: 400,
    };
  }

  const now = new Date().toISOString();

  // Claim token (single-use) before Auth update
  try {
    await db.runTransaction(async (tx) => {
      const fresh = await tx.get(ref);
      const d = fresh.data() as TokenDoc | undefined;
      if (!d) throw new Error("MISSING");
      if (d.usedAt) throw new Error("USED");
      if (d.revokedAt) throw new Error("REVOKED");
      if (new Date(d.expiresAt).getTime() < Date.now()) throw new Error("EXPIRED");
      tx.set(ref, { usedAt: now }, { merge: true });
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "USED") {
      return { ok: false, error: "This verification link was already used", status: 410 };
    }
    if (msg === "REVOKED") {
      return {
        ok: false,
        error: "This verification link was replaced. Request a new email.",
        status: 410,
      };
    }
    if (msg === "EXPIRED") {
      return {
        ok: false,
        error: "This verification link has expired. Request a new email.",
        status: 410,
      };
    }
    throw err;
  }

  if (!authUser.emailVerified) {
    await adminAuth().updateUser(data.uid, { emailVerified: true });
  }

  await db
    .collection(COLLECTIONS.users)
    .doc(data.uid)
    .set(
      {
        email: authEmail,
        emailVerified: true,
        updatedAt: now,
      },
      { merge: true },
    );

  const indId = await issueIndOnce(data.uid);
  console.info("[verify-email] confirmed", { uid: data.uid, indId });

  return { ok: true, uid: data.uid, indId };
}

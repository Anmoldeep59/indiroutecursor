import { createHash, randomBytes, randomInt } from "crypto";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { emailShell, sendTransactionalEmail } from "@/lib/email/resend";
import { issueIndOnce } from "@/lib/auth/issueInd";

/** OTP lifetime — shorter than old magic links */
export const VERIFY_OTP_TTL_MS = 15 * 60 * 1000;
export const VERIFY_RESEND_COOLDOWN_MS = 60_000;
export const VERIFY_MAX_SENDS_PER_HOUR = 5;
export const VERIFY_OTP_MAX_ATTEMPTS = 5;

type TokenDoc = {
  id: string;
  uid: string;
  email: string;
  tokenHash: string;
  kind: "otp";
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  revokedAt: string | null;
  attempts: number;
};

type VerifyMeta = {
  lastSentAt?: string;
  hourWindowStart?: string;
  sendsInWindow?: number;
};

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

function newOtpCode(): string {
  return String(randomInt(100000, 999999));
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
 * Create a one-time 6-digit OTP and send via Resend.
 * Skips when Firebase already reports emailVerified (e.g. Google).
 * Never uses Firebase sendEmailVerification.
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
    console.info("[verify-otp] skip send — already verified", input.uid);
    await issueIndOnce(input.uid);
    return { ok: true, skipped: true };
  }

  // Google / federated providers must not receive OTP emails
  const providers = authUser.providerData.map((p) => p.providerId);
  if (providers.includes("google.com") && !providers.includes("password")) {
    if (!authUser.emailVerified) {
      await adminAuth().updateUser(input.uid, { emailVerified: true });
    }
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

  const otp = newOtpCode();
  const tokenHash = hashToken(otp);
  const now = new Date();
  const expires = new Date(now.getTime() + VERIFY_OTP_TTL_MS);
  const id = randomBytes(16).toString("hex");
  const doc: TokenDoc = {
    id,
    uid: input.uid,
    email,
    tokenHash,
    kind: "otp",
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    usedAt: null,
    revokedAt: null,
    attempts: 0,
  };
  await adminDb()
    .collection(COLLECTIONS.emailVerificationTokens)
    .doc(id)
    .set(doc);

  const name = input.displayName?.trim() || "there";
  const minutes = Math.round(VERIFY_OTP_TTL_MS / 60000);

  const html = emailShell(
    "Your IndiRoute verification code",
    `<p>Welcome to IndiRoute, ${escapeHtml(name)}.</p>
     <p>Enter this one-time code to verify your email and unlock your India warehouse address:</p>
     <p style="margin:28px 0;text-align:center">
       <span style="display:inline-block;letter-spacing:0.35em;font-size:32px;font-weight:800;color:#0a1b30;background:#fff4eb;border:1px solid #ff671f;padding:14px 22px;border-radius:8px">
         ${escapeHtml(otp)}
       </span>
     </p>
     <p style="font-size:13px;color:#5c6f68">This code expires in ${minutes} minutes and can be used once.</p>
     <p style="font-size:13px;color:#5c6f68">If you did not create an IndiRoute account, you can ignore this email.</p>`,
  );

  if (!process.env.RESEND_API_KEY) {
    console.error("[verify-otp] RESEND_API_KEY missing — cannot send");
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
    subject: "Your IndiRoute verification code",
    html,
  });

  if (!sent.ok || sent.skipped || !sent.id) {
    console.error("[verify-otp] Resend failed — not falling back to Firebase", {
      uid: input.uid,
      email,
      skipped: sent.skipped,
      error: sent.error,
    });
    return {
      ok: false,
      error:
        sent.error ||
        "Could not send verification code via Resend. Try again shortly.",
      status: sent.skipped ? 503 : 502,
    };
  }

  await bumpRateLimit(input.uid);

  console.info("[verify-otp] Resend OTP sent", {
    uid: input.uid,
    email,
    messageId: sent.id,
  });

  return { ok: true, messageId: sent.id };
}

export type ConfirmVerificationResult =
  | { ok: true; uid: string; indId: string | null }
  | { ok: false; error: string; status: number };

async function markVerifiedAndIssueInd(
  uid: string,
  email: string,
): Promise<ConfirmVerificationResult> {
  const authUser = await adminAuth().getUser(uid);
  if (!authUser.emailVerified) {
    await adminAuth().updateUser(uid, { emailVerified: true });
  }
  const now = new Date().toISOString();
  await adminDb()
    .collection(COLLECTIONS.users)
    .doc(uid)
    .set(
      {
        email: email.toLowerCase(),
        emailVerified: true,
        updatedAt: now,
      },
      { merge: true },
    );
  const indId = await issueIndOnce(uid);
  console.info("[verify-otp] confirmed", { uid, indId });
  return { ok: true, uid, indId };
}

/** Validate 6-digit OTP for the signed-in user; mark emailVerified + issue IND. */
export async function confirmEmailOtp(input: {
  uid: string;
  code: string;
}): Promise<ConfirmVerificationResult> {
  const code = input.code.replace(/\s+/g, "").trim();
  if (!/^\d{6}$/.test(code)) {
    return { ok: false, error: "Enter the 6-digit code from your email", status: 400 };
  }

  const authUser = await adminAuth().getUser(input.uid);
  if (authUser.emailVerified) {
    const indId = await issueIndOnce(input.uid);
    return { ok: true, uid: input.uid, indId };
  }

  const db = adminDb();
  // Single-field query (avoid composite index); filter OTP kind in memory
  const snap = await db
    .collection(COLLECTIONS.emailVerificationTokens)
    .where("uid", "==", input.uid)
    .limit(30)
    .get();

  const candidates = snap.docs
    .map((d) => ({ ref: d.ref, data: d.data() as TokenDoc }))
    .filter(
      (c) =>
        c.data.kind === "otp" &&
        !c.data.revokedAt &&
        !c.data.usedAt,
    )
    .sort(
      (a, b) =>
        new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime(),
    );

  const active = candidates[0];
  if (!active) {
    return {
      ok: false,
      error: "No active verification code. Request a new code.",
      status: 400,
    };
  }

  const { ref, data } = active;
  if (new Date(data.expiresAt).getTime() < Date.now()) {
    await ref.set({ revokedAt: new Date().toISOString() }, { merge: true });
    return {
      ok: false,
      error: "This code has expired. Request a new code.",
      status: 410,
    };
  }

  if ((data.attempts ?? 0) >= VERIFY_OTP_MAX_ATTEMPTS) {
    await ref.set({ revokedAt: new Date().toISOString() }, { merge: true });
    return {
      ok: false,
      error: "Too many incorrect attempts. Request a new code.",
      status: 429,
    };
  }

  const codeHash = hashToken(code);
  if (codeHash !== data.tokenHash) {
    await ref.set({ attempts: (data.attempts ?? 0) + 1 }, { merge: true });
    return { ok: false, error: "Incorrect verification code", status: 400 };
  }

  const authEmail = (authUser.email || "").toLowerCase();
  if (!authEmail || authEmail !== data.email.toLowerCase()) {
    return {
      ok: false,
      error: "Verification code does not match this account",
      status: 400,
    };
  }

  const now = new Date().toISOString();
  try {
    await db.runTransaction(async (tx) => {
      const fresh = await tx.get(ref);
      const d = fresh.data() as TokenDoc | undefined;
      if (!d) throw new Error("MISSING");
      if (d.usedAt) throw new Error("USED");
      if (d.revokedAt) throw new Error("REVOKED");
      if (new Date(d.expiresAt).getTime() < Date.now()) throw new Error("EXPIRED");
      if (hashToken(code) !== d.tokenHash) throw new Error("MISMATCH");
      tx.set(ref, { usedAt: now }, { merge: true });
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "USED" || msg === "REVOKED") {
      return {
        ok: false,
        error: "This code is no longer valid. Request a new code.",
        status: 410,
      };
    }
    if (msg === "EXPIRED") {
      return {
        ok: false,
        error: "This code has expired. Request a new code.",
        status: 410,
      };
    }
    if (msg === "MISMATCH") {
      return { ok: false, error: "Incorrect verification code", status: 400 };
    }
    throw err;
  }

  return markVerifiedAndIssueInd(input.uid, authEmail);
}

/**
 * Legacy magic-link confirm (kept for old emails). Prefer OTP.
 * @deprecated OTP is the primary path
 */
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
  const data = snap.docs[0]!.data() as TokenDoc & { kind?: string };

  if (data.kind === "otp") {
    return {
      ok: false,
      error: "Use the 6-digit code from your email on the verification page.",
      status: 400,
    };
  }
  if (data.usedAt) {
    return { ok: false, error: "This verification link was already used", status: 410 };
  }
  if (data.revokedAt) {
    return {
      ok: false,
      error: "This verification link was replaced. Request a new code.",
      status: 410,
    };
  }
  if (new Date(data.expiresAt).getTime() < Date.now()) {
    return {
      ok: false,
      error: "This verification link has expired. Request a new code.",
      status: 410,
    };
  }

  const authUser = await adminAuth().getUser(data.uid);
  const authEmail = (authUser.email || "").toLowerCase();
  if (!authEmail || authEmail !== data.email.toLowerCase()) {
    return {
      ok: false,
      error: "Verification link does not match this account",
      status: 400,
    };
  }

  const now = new Date().toISOString();
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
    if (msg === "USED" || msg === "REVOKED" || msg === "EXPIRED") {
      return {
        ok: false,
        error: "This verification link is no longer valid.",
        status: 410,
      };
    }
    throw err;
  }

  return markVerifiedAndIssueInd(data.uid, authEmail);
}

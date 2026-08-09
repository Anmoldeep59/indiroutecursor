/**
 * Tests custom Resend email-verification token flow (Admin + API).
 * Requires: .env.local with Firebase Admin, next dev on :3000
 * RESEND_API_KEY optional — without it send is skipped but token path still tested via direct confirm.
 */
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { initializeApp as initAdmin, cert, getApps } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { createHash, randomBytes } from "crypto";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    env[k] = v.replace(/\\n/g, "\n");
  }
  return env;
}

const env = loadEnv();
const client = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const auth = getAuth(client);
if (!getApps().length) {
  initAdmin({
    credential: cert({
      projectId: env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY,
    }),
  });
}

const stamp = Date.now();
const email = `indiroute.verify.${stamp}@mailinator.com`;
const password = `TestPass!${stamp}`;
const results = [];
const log = (step, ok, detail = "") => {
  results.push({ step, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${step}${detail ? " — " + detail : ""}`);
};

const cred = await createUserWithEmailAndPassword(auth, email, password);
const uid = cred.user.uid;
log("createUser", true, uid);

const idToken = await cred.user.getIdToken(true);
let res = await fetch("http://localhost:3000/api/auth/ensure-profile", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${idToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ displayName: "Verify Tester" }),
});
let data = await res.json();
log(
  "ensure-profile unverified",
  res.ok && data.profile?.indId == null && data.profile?.emailVerified === false,
  `ind=${data.profile?.indId ?? "null"}`,
);

res = await fetch("http://localhost:3000/api/auth/send-verification", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${idToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ displayName: "Verify Tester" }),
});
data = await res.json();
const hasResend = Boolean(env.RESEND_API_KEY);
if (!hasResend) {
  log(
    "send-verification (config gate)",
    res.status === 503,
    "RESEND_API_KEY missing — correctly blocked until founder adds key",
  );
} else {
  log("send-verification", res.ok, data.message || data.error || "ok");
}

// Reject email-only verify attempt
res = await fetch("http://localhost:3000/api/auth/confirm-email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email }),
});
log("reject email-only confirm", res.status === 400, `status=${res.status}`);

// Invalid token
res = await fetch("http://localhost:3000/api/auth/confirm-email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ token: "not-a-real-token-value-xxxxxx" }),
});
log("reject invalid token", res.status === 400, `status=${res.status}`);

// Plant a valid hashed token via Admin and confirm
const raw = randomBytes(32).toString("base64url");
const tokenHash = createHash("sha256").update(raw).digest("hex");
const db = getFirestore();
const tokenId = randomBytes(8).toString("hex");
const now = new Date();
await db
  .collection("emailVerificationTokens")
  .doc(tokenId)
  .set({
    id: tokenId,
    uid,
    email,
    tokenHash,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    usedAt: null,
    revokedAt: null,
  });

res = await fetch("http://localhost:3000/api/auth/confirm-email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ token: raw }),
});
data = await res.json();
log(
  "confirm valid token",
  res.ok && Boolean(data.indId),
  `indId=${data.indId} err=${data.error || ""}`,
);

const authUser = await getAdminAuth().getUser(uid);
log("firebase emailVerified", authUser.emailVerified === true);

// Reuse token
res = await fetch("http://localhost:3000/api/auth/confirm-email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ token: raw }),
});
log("reject used token", res.status === 410, `status=${res.status}`);

// Expired token
const raw2 = randomBytes(32).toString("base64url");
const hash2 = createHash("sha256").update(raw2).digest("hex");
const tid2 = randomBytes(8).toString("hex");
await db
  .collection("emailVerificationTokens")
  .doc(tid2)
  .set({
    id: tid2,
    uid,
    email,
    tokenHash: hash2,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() - 1000).toISOString(),
    usedAt: null,
    revokedAt: null,
  });
res = await fetch("http://localhost:3000/api/auth/confirm-email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ token: raw2 }),
});
log("reject expired token", res.status === 410, `status=${res.status}`);

// Idempotent IND
const token2 = await cred.user.getIdToken(true);
await cred.user.reload();
res = await fetch("http://localhost:3000/api/auth/ensure-profile", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token2}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ displayName: "Verify Tester" }),
});
const again = await res.json();
log(
  "IND stable",
  again.profile?.indId === data.indId,
  `${again.profile?.indId} vs ${data.indId}`,
);

// cleanup
try {
  await db.collection("users").doc(uid).delete();
  await db.collection("indIndex").doc(data.indId).delete().catch(() => {});
  await deleteUser(cred.user);
  log("cleanup", true);
} catch {
  await signOut(auth);
  const againUser = await signInWithEmailAndPassword(auth, email, password);
  await deleteUser(againUser.user);
  log("cleanup", true, "relogin");
}

const failed = results.some((r) => !r.ok);
console.log("\n--- SUMMARY ---");
for (const r of results) console.log(`${r.ok ? "✓" : "✗"} ${r.step}: ${r.detail}`);
if (!hasResend) {
  console.log(
    "\nNOTE: Add RESEND_API_KEY (+ RESEND_FROM_EMAIL) to .env.local for live inbox delivery.",
  );
}
process.exit(failed ? 1 : 0);

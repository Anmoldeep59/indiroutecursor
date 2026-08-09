/**
 * End-to-end Resend OTP verification (no Firebase sendEmailVerification).
 */
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { initializeApp as initAdmin, cert, getApps } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { createHash } from "crypto";
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
const base = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const stamp = Date.now();
const email = `indiroute.otp.${stamp}@mailinator.com`;
const password = `TestPass!${stamp}`;
const results = [];
const log = (step, ok, detail = "") => {
  results.push({ step, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${step}${detail ? " — " + detail : ""}`);
};

const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const auth = getAuth(app);
if (!getApps().length) {
  initAdmin({
    credential: cert({
      projectId: env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY,
    }),
  });
}

const cred = await createUserWithEmailAndPassword(auth, email, password);
await updateProfile(cred.user, { displayName: "OTP Tester" });
const uid = cred.user.uid;
log("createUser", true, uid);

const idToken = await cred.user.getIdToken(true);
let res = await fetch(`${base}/api/auth/ensure-profile`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${idToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ displayName: "OTP Tester" }),
});
log("ensure-profile", res.ok, String(res.status));

res = await fetch(`${base}/api/auth/send-verification`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${idToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ displayName: "OTP Tester" }),
});
let data = await res.json();
log(
  "send OTP via Resend",
  res.ok && data.provider === "resend",
  `messageId=${data.messageId || data.error || ""}`,
);

const db = getFirestore();
const tokens = await db
  .collection("emailVerificationTokens")
  .where("uid", "==", uid)
  .limit(10)
  .get();
const otpDoc = tokens.docs
  .map((d) => d.data())
  .find((d) => d.kind === "otp" && !d.usedAt && !d.revokedAt);
log("otp token stored", Boolean(otpDoc), otpDoc ? `kind=${otpDoc.kind}` : "missing");

// Brute-force find OTP by hashing 000000-999999 is too heavy.
// Instead: Admin plants known OTP by updating hash for test confirm path,
// OR we read nothing — use confirm with wrong then plant.
const known = "482917";
const hash = createHash("sha256").update(known).digest("hex");
if (otpDoc) {
  const ref = tokens.docs.find((d) => d.data().tokenHash === otpDoc.tokenHash);
  if (ref) {
    await ref.ref.set({ tokenHash: hash }, { merge: true });
  }
}

res = await fetch(`${base}/api/auth/confirm-otp`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${idToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ code: "000000" }),
});
log("reject wrong OTP", res.status === 400, `status=${res.status}`);

res = await fetch(`${base}/api/auth/confirm-otp`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${idToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ code: known }),
});
data = await res.json();
log(
  "confirm OTP",
  res.ok && Boolean(data.indId),
  `indId=${data.indId || data.error || ""}`,
);

const authUser = await getAdminAuth().getUser(uid);
log("firebase emailVerified", authUser.emailVerified === true);

try {
  for (const d of tokens.docs) await d.ref.delete().catch(() => {});
  if (data.indId) await db.collection("indIndex").doc(data.indId).delete().catch(() => {});
  await db.collection("users").doc(uid).delete().catch(() => {});
  await deleteUser(cred.user);
  log("cleanup", true);
} catch {
  await signOut(auth);
  const again = await signInWithEmailAndPassword(auth, email, password);
  await deleteUser(again.user);
  log("cleanup", true, "relogin");
}

console.log("\n--- SUMMARY ---");
for (const r of results) console.log(`${r.ok ? "✓" : "✗"} ${r.step}: ${r.detail}`);
process.exit(results.some((r) => !r.ok) ? 1 : 0);

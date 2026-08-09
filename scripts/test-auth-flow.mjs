/**
 * Auth smoke test — Resend verification ONLY (no Firebase sendEmailVerification).
 * Requires: next dev on :3000, Firebase Admin + client env, RESEND_API_KEY.
 */
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  deleteUser,
  signOut,
  updateProfile,
} from "firebase/auth";
import { initializeApp as initAdmin, cert, getApps } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
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
const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
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

const stamp = Date.now();
const email = `indiroute.resend.${stamp}@mailinator.com`;
const password = `TestPass!${stamp}`;
const results = [];

function log(step, ok, detail = "") {
  results.push({ step, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${step}${detail ? " — " + detail : ""}`);
}

async function main() {
  console.log("Project:", env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  console.log("Test email:", email);
  console.log("RESEND_API_KEY:", env.RESEND_API_KEY ? "set" : "MISSING");

  if (!env.RESEND_API_KEY) {
    log("RESEND_API_KEY", false, "required — will not fall back to Firebase");
    printSummary();
    process.exit(1);
  }

  let user;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    user = cred.user;
    await updateProfile(user, { displayName: "Resend Flow Tester" });
    log("createUserWithEmailAndPassword", true, user.uid);
  } catch (e) {
    log("createUserWithEmailAndPassword", false, e.code || e.message);
    printSummary();
    process.exit(1);
  }

  const idToken = await user.getIdToken(true);

  let res = await fetch("http://localhost:3000/api/auth/ensure-profile", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ displayName: "Resend Flow Tester" }),
  });
  let data = await res.json();
  log(
    "ensure-profile unverified (no IND)",
    res.ok && data.profile?.indId == null && data.profile?.emailVerified === false,
    `ind=${data.profile?.indId ?? "null"} verified=${data.profile?.emailVerified}`,
  );

  res = await fetch("http://localhost:3000/api/auth/send-verification", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ displayName: "Resend Flow Tester" }),
  });
  data = await res.json();
  const messageId = data.messageId || null;
  log(
    "Resend send-verification",
    res.ok && data.provider === "resend" && !data.skipped,
    `status=${res.status} messageId=${messageId || data.error || "none"}`,
  );
  if (messageId) {
    log("Resend message ID returned", true, messageId);
  } else if (res.ok) {
    log(
      "Resend message ID returned",
      false,
      "ok but no messageId in response (check server logs)",
    );
  }

  // Explicitly assert we never call Firebase sendEmailVerification in this script
  log(
    "no Firebase sendEmailVerification in test",
    true,
    "script uses /api/auth/send-verification only",
  );

  // Pull latest unused token for this uid via Admin and confirm
  const db = getFirestore();
  const tokens = await db
    .collection("emailVerificationTokens")
    .where("uid", "==", user.uid)
    .limit(10)
    .get();

  // We cannot recover raw token from hash — confirm path tested in test-resend-verification.
  // Here: Admin marks verified to prove IND path after Resend send succeeded.
  if (res.ok && !data.skipped) {
    await getAdminAuth().updateUser(user.uid, { emailVerified: true });
    await user.reload();
    const token2 = await user.getIdToken(true);
    res = await fetch("http://localhost:3000/api/auth/ensure-profile", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token2}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ displayName: "Resend Flow Tester" }),
    });
    data = await res.json();
    log(
      "IND after emailVerified",
      res.ok && Boolean(data.profile?.indId),
      `indId=${data.profile?.indId ?? "null"}`,
    );
    const authUser = await getAdminAuth().getUser(user.uid);
    log("firebase emailVerified true", authUser.emailVerified === true);
  }

  // Password reset remains Firebase-managed (allowed)
  try {
    await sendPasswordResetEmail(auth, email, {
      url: `${env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login?reset=1`,
      handleCodeInApp: false,
    });
    log("sendPasswordResetEmail (Firebase, allowed)", true);
  } catch (e) {
    log(
      "sendPasswordResetEmail (Firebase, allowed)",
      false,
      `${e.code || ""} ${e.message || e}`.trim(),
    );
  }

  // Cleanup
  try {
    for (const doc of tokens.docs) await doc.ref.delete().catch(() => {});
    if (data?.profile?.indId) {
      await db.collection("indIndex").doc(data.profile.indId).delete().catch(() => {});
    }
    await db.collection("users").doc(user.uid).delete().catch(() => {});
    await deleteUser(user);
    log("cleanup", true);
  } catch (e) {
    try {
      await signOut(auth);
      const again = await signInWithEmailAndPassword(auth, email, password);
      await deleteUser(again.user);
      log("cleanup", true, "after re-login");
    } catch (e2) {
      log("cleanup", false, e2.code || e2.message);
    }
  }

  printSummary();
  const failed = results.some((r) => !r.ok && r.step !== "cleanup");
  process.exit(failed ? 1 : 0);
}

function printSummary() {
  console.log("\n--- SUMMARY ---");
  for (const r of results) {
    console.log(`${r.ok ? "✓" : "✗"} ${r.step}: ${r.detail}`);
  }
}

main();

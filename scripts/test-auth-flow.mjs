/**
 * Integration smoke test for Firebase Auth email flows (dev).
 * Creates a disposable user, sends verification + reset, issues IND via ensure-profile.
 */
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  deleteUser,
  signOut,
} from "firebase/auth";
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
const stamp = Date.now();
const email = `indiroute.test.${stamp}@mailinator.com`;
const password = `TestPass!${stamp}`;
const continueUrl = `${env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?verified=1`;

const results = [];

function log(step, ok, detail = "") {
  results.push({ step, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${step}${detail ? " — " + detail : ""}`);
}

async function main() {
  console.log("Project:", env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  console.log("Auth domain:", env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
  console.log("Continue URL:", continueUrl);
  console.log("Test email:", email);

  let user;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    user = cred.user;
    log("createUserWithEmailAndPassword", true, user.uid);
  } catch (e) {
    log("createUserWithEmailAndPassword", false, e.code || e.message);
    printSummary();
    process.exit(1);
  }

  try {
    await sendEmailVerification(user, {
      url: continueUrl,
      handleCodeInApp: false,
    });
    log("sendEmailVerification", true, "Firebase accepted send request");
  } catch (e) {
    log(
      "sendEmailVerification",
      false,
      `${e.code || ""} ${e.message || e}`.trim(),
    );
  }

  // Immediate second send is expected to hit Firebase rate limits;
  // production UI enforces a 60s cooldown before calling again.
  try {
    await sendEmailVerification(user, {
      url: continueUrl,
      handleCodeInApp: false,
    });
    log("resendVerification", true, "second send accepted");
  } catch (e) {
    if (e.code === "auth/too-many-requests") {
      log(
        "resendVerification",
        true,
        "rate-limited as expected without cooldown (UI blocks for 60s)",
      );
    } else {
      log("resendVerification", false, `${e.code || ""} ${e.message || e}`.trim());
    }
  }

  try {
    await sendPasswordResetEmail(auth, email, {
      url: `${env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login?reset=1`,
      handleCodeInApp: false,
    });
    log("sendPasswordResetEmail", true, "Firebase accepted reset request");
  } catch (e) {
    log(
      "sendPasswordResetEmail",
      false,
      `${e.code || ""} ${e.message || e}`.trim(),
    );
  }

  // ensure-profile without verified email → no IND
  try {
    const token = await user.getIdToken(true);
    const res = await fetch("http://localhost:3000/api/auth/ensure-profile", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ displayName: "Test User" }),
    });
    const data = await res.json();
    if (!res.ok) {
      log("ensure-profile (unverified)", false, data.error || res.status);
    } else {
      const noInd = !data.profile?.indId;
      log(
        "ensure-profile (unverified)",
        noInd && data.profile?.emailVerified === false,
        `indId=${data.profile?.indId ?? "null"} emailVerified=${data.profile?.emailVerified}`,
      );
    }
  } catch (e) {
    log("ensure-profile (unverified)", false, e.message);
  }

  // Cleanup
  try {
    await deleteUser(user);
    log("cleanup deleteUser", true);
  } catch (e) {
    // may fail if recent login required — sign in again
    try {
      await signOut(auth);
      const again = await signInWithEmailAndPassword(auth, email, password);
      await deleteUser(again.user);
      log("cleanup deleteUser", true, "after re-login");
    } catch (e2) {
      log("cleanup deleteUser", false, e2.code || e2.message);
      console.warn("Manual cleanup needed for", email);
    }
  }

  printSummary();
  const failed = results.some((r) => !r.ok && r.step !== "cleanup deleteUser");
  process.exit(failed ? 1 : 0);
}

function printSummary() {
  console.log("\n--- SUMMARY ---");
  for (const r of results) {
    console.log(`${r.ok ? "✓" : "✗"} ${r.step}: ${r.detail}`);
  }
}

main();

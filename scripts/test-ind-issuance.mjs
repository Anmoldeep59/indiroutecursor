/**
 * Tests idempotent IND issuance after email verification (Admin marks verified).
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
const email = `indiroute.ind.${stamp}@mailinator.com`;
const password = `TestPass!${stamp}`;

async function ensure(token, name) {
  const res = await fetch("http://localhost:3000/api/auth/ensure-profile", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ displayName: name }),
  });
  const data = await res.json();
  return { status: res.status, data };
}

const cred = await createUserWithEmailAndPassword(auth, email, password);
console.log("uid", cred.user.uid);

let token = await cred.user.getIdToken(true);
let r1 = await ensure(token, "IND Tester");
console.log("unverified", r1.status, {
  emailVerified: r1.data?.profile?.emailVerified,
  indId: r1.data?.profile?.indId ?? null,
  error: r1.data?.error,
});

await getAdminAuth().updateUser(cred.user.uid, { emailVerified: true });
await cred.user.reload();
token = await cred.user.getIdToken(true);
console.log("client emailVerified", cred.user.emailVerified);

let r2 = await ensure(token, "IND Tester");
const indA = r2.data?.profile?.indId;
console.log("verified once", r2.status, {
  emailVerified: r2.data?.profile?.emailVerified,
  indId: indA,
  error: r2.data?.error,
});

let r3 = await ensure(token, "IND Tester");
const indB = r3.data?.profile?.indId;
console.log("verified twice", r3.status, { indId: indB });

const ok =
  r1.status === 200 &&
  !r1.data?.profile?.indId &&
  r2.status === 200 &&
  typeof indA === "string" &&
  /^IND-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/.test(indA) &&
  indA === indB;

console.log(ok ? "PASS IND issuance idempotent" : "FAIL IND issuance");

// cleanup auth + firestore docs best-effort
try {
  const db = getFirestore();
  if (indA) await db.collection("indIndex").doc(indA).delete().catch(() => {});
  await db.collection("users").doc(cred.user.uid).delete().catch(() => {});
  await deleteUser(cred.user);
} catch {
  await signOut(auth);
  const again = await signInWithEmailAndPassword(auth, email, password);
  await deleteUser(again.user);
}

process.exit(ok ? 0 : 1);

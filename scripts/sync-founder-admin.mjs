/**
 * Syncs ADMIN_EMAIL / ADMIN_PASSWORD from .env.local into Firebase Auth + staff doc,
 * then verifies client sign-in. No verification email.
 */
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
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
const email = (env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = (env.ADMIN_PASSWORD || "").trim();
const displayName = (env.ADMIN_DISPLAY_NAME || "IndiRoute Admin").trim();

if (!email || !password) {
  console.error("FAIL missing ADMIN_EMAIL or ADMIN_PASSWORD");
  process.exit(1);
}
if (password.length < 8) {
  console.error("FAIL ADMIN_PASSWORD must be at least 8 characters");
  process.exit(1);
}

console.log("email", email, "passLen", password.length);

if (!getApps().length) {
  initAdmin({
    credential: cert({
      projectId: env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY,
    }),
  });
}

const adminAuth = getAdminAuth();
const db = getFirestore();
let uid;
let created = false;
try {
  const existing = await adminAuth.getUserByEmail(email);
  uid = existing.uid;
  await adminAuth.updateUser(uid, {
    password,
    emailVerified: true,
    disabled: false,
    displayName,
  });
} catch (err) {
  if (err?.code !== "auth/user-not-found") throw err;
  const createdUser = await adminAuth.createUser({
    email,
    password,
    emailVerified: true,
    disabled: false,
    displayName,
  });
  uid = createdUser.uid;
  created = true;
}

const now = new Date().toISOString();
await db
  .collection("staff")
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

console.log(created ? "created" : "updated", uid);

const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const auth = getAuth(app);
try {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  console.log("LOGIN_OK", cred.user.uid, "verified", cred.user.emailVerified);
  await signOut(auth);
} catch (e) {
  console.error("LOGIN_FAIL", e.code || e.message);
  process.exit(1);
}

import { readFileSync } from "fs";
import { resolve } from "path";
import { initializeApp as initAdmin, cert, getApps } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";

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

console.log("clientProject", env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log("adminProject", env.FIREBASE_ADMIN_PROJECT_ID);
console.log("projectsMatch", env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === env.FIREBASE_ADMIN_PROJECT_ID);
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

const auth = getAdminAuth();
const db = getFirestore();
const user = await auth.getUserByEmail(email);
console.log("authUser", {
  uid: user.uid,
  email: user.email,
  verified: user.emailVerified,
  disabled: user.disabled,
});

const staff = await db.collection("staff").doc(user.uid).get();
console.log("staffByUid", staff.exists ? staff.data() : null);

const byEmail = await db.collection("staff").where("email", "==", email).limit(5).get();
console.log(
  "staffByEmail",
  byEmail.docs.map((d) => ({ id: d.id, ...d.data() })),
);

const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const clientAuth = getAuth(app);
const cred = await signInWithEmailAndPassword(clientAuth, email, password);
const token = await cred.user.getIdToken(true);
console.log("clientUid", cred.user.uid, "sameAsAdmin", cred.user.uid === user.uid);

const res = await fetch("http://localhost:3000/api/admin/session", {
  headers: { Authorization: `Bearer ${token}` },
});
const data = await res.json();
console.log("sessionStatus", res.status, data);

// Also bootstrap
const boot = await fetch("http://localhost:3000/api/admin/bootstrap", { method: "POST" });
console.log("bootstrap", boot.status, await boot.json());

const res2 = await fetch("http://localhost:3000/api/admin/session", {
  headers: { Authorization: `Bearer ${token}` },
});
console.log("sessionAfterBootstrap", res2.status, await res2.json());

await signOut(clientAuth);

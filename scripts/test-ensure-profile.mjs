import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
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
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const auth = getAuth(app);
const stamp = Date.now();
const email = `indiroute.profile.${stamp}@mailinator.com`;
const password = `TestPass!${stamp}`;

const cred = await createUserWithEmailAndPassword(auth, email, password);
const token = await cred.user.getIdToken(true);
const res = await fetch("http://localhost:3000/api/auth/ensure-profile", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ displayName: "Profile Test" }),
});
const text = await res.text();
console.log("status", res.status);
console.log("body", text);

try {
  await deleteUser(cred.user);
} catch {
  await signOut(auth);
  const again = await signInWithEmailAndPassword(auth, email, password);
  await deleteUser(again.user);
}

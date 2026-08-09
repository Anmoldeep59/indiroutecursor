import {
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

/** Normalize Vercel/dotenv private key variants into PEM. */
export function normalizePrivateKey(raw: string | undefined): string {
  if (!raw) return "";
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  // Vercel/dotenv may store one or more layers of escaped newlines
  for (let i = 0; i < 3 && key.includes("\\n"); i++) {
    key = key.replace(/\\n/g, "\n");
  }
  return key;
}

function isAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
      normalizePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
  );
}

let adminApp: App | undefined;
let initError: string | null = null;

export function getAdminInitError(): string | null {
  return initError;
}

export function getAdminApp(): App {
  if (!isAdminConfigured()) {
    throw new Error("Firebase Admin env vars are not configured");
  }
  if (adminApp) return adminApp;

  try {
    const existing = getApps()[0];
    if (existing) {
      adminApp = existing;
      return adminApp;
    }

    const privateKey = normalizePrivateKey(
      process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    );
    if (!privateKey.includes("BEGIN PRIVATE KEY")) {
      throw new Error(
        "FIREBASE_ADMIN_PRIVATE_KEY is malformed (missing BEGIN PRIVATE KEY)",
      );
    }

    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    initError = null;
    return adminApp;
  } catch (err) {
    initError = err instanceof Error ? err.message : "Firebase Admin init failed";
    console.error("[firebase-admin] init failed", initError);
    throw err;
  }
}

export function adminAuth() {
  return getAuth(getAdminApp());
}

export function adminDb() {
  return getFirestore(getAdminApp());
}

export function adminStorage() {
  return getStorage(getAdminApp());
}

export { isAdminConfigured };

import { NextResponse } from "next/server";
import {
  getAdminInitError,
  isAdminConfigured,
  normalizePrivateKey,
} from "@/lib/firebase/admin";

export const runtime = "nodejs";

/** Non-secret diagnostics for production admin API failures. */
export async function GET() {
  const privateKey = normalizePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);
  const configured = isAdminConfigured();
  let initOk: boolean | null = null;
  let initError: string | null = null;

  if (configured) {
    try {
      const { getAdminApp } = await import("@/lib/firebase/admin");
      getAdminApp();
      initOk = true;
    } catch (err) {
      initOk = false;
      initError =
        getAdminInitError() ||
        (err instanceof Error ? err.message : "init failed");
    }
  }

  return NextResponse.json({
    ok: configured && initOk === true,
    adminConfigured: configured,
    adminInitOk: initOk,
    adminInitError: initError,
    hasAdminEmail: Boolean(process.env.ADMIN_EMAIL?.trim()),
    hasAdminPassword: Boolean(process.env.ADMIN_PASSWORD?.trim()),
    privateKeyLooksPem: privateKey.includes("BEGIN PRIVATE KEY"),
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || null,
    runtime: "nodejs",
  });
}

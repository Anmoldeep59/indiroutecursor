"use client";

import { isSupported, getAnalytics, type Analytics } from "firebase/analytics";
import { getFirebaseApp, isFirebaseClientConfigured } from "@/lib/firebase/client";

let analytics: Analytics | null = null;

/** Browser-only. Safe to call from client components; no-ops on server. */
export async function initAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return null;
  if (!isFirebaseClientConfigured()) return null;
  if (!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) return null;
  if (analytics) return analytics;
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;
  analytics = getAnalytics(getFirebaseApp());
  return analytics;
}

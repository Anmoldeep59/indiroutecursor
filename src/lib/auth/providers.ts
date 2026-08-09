import type { User } from "firebase/auth";

/** True when the account can sign in with email/password (needs Resend OTP until verified). */
export function hasPasswordProvider(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.providerData.some((p) => p.providerId === "password");
}

/** True when Google is the only / primary federated provider (Firebase-verified). */
export function isGoogleOnlyUser(user: User | null | undefined): boolean {
  if (!user) return false;
  const providers = user.providerData.map((p) => p.providerId);
  return providers.includes("google.com") && !providers.includes("password");
}

/**
 * Email/password users must complete Resend OTP before dashboard.
 * Google users are verified by Firebase/Google — no OTP gate.
 */
export function needsResendOtp(
  user: User | null | undefined,
  emailVerified: boolean,
): boolean {
  if (!user || emailVerified) return false;
  if (isGoogleOnlyUser(user)) return false;
  return hasPasswordProvider(user) || user.providerData.length === 0;
}

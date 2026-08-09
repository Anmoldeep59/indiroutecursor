/**
 * Firebase ActionCodeSettings — password reset ONLY.
 * Do NOT use for email verification (that path is Resend + /verify-email).
 */
export function getAuthContinueUrl(path = "/login"): string {
  const base =
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL) || "http://localhost:3000";
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base.replace(/\/$/, "")}${clean}`;
}

/** Password-reset continue URL settings (Firebase-managed). */
export function passwordResetActionCodeSettings(
  continuePath = "/login?reset=1",
) {
  return {
    url: getAuthContinueUrl(continuePath),
    handleCodeInApp: false as const,
  };
}

/** @deprecated Use passwordResetActionCodeSettings — never for email verification */
export function emailActionCodeSettings(continuePath = "/login?reset=1") {
  return passwordResetActionCodeSettings(continuePath);
}

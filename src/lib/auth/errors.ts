/** Map Firebase Auth errors to safe, useful UI messages (no secrets). */
export function authErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  const code =
    typeof err === "object" && err && "code" in err
      ? String((err as { code?: string }).code)
      : "";
  const message = err instanceof Error ? err.message : fallback;

  switch (code) {
    case "auth/email-already-in-use":
      return "An account already exists for that email. Try logging in.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 8 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many email requests. Resend available in about 60 seconds — check inbox/spam first.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/unauthorized-continue-uri":
      return "This domain is not authorized for email links. Add localhost / indiroute.co in Firebase Console → Authentication → Settings → Authorized domains.";
    case "auth/invalid-continue-uri":
      return "Invalid continue URL for email verification. Check NEXT_PUBLIC_APP_URL.";
    case "auth/missing-continue-uri":
      return "Missing continue URL for email action.";
    case "auth/operation-not-allowed":
      return "Email/password sign-in is disabled in Firebase Console → Authentication → Sign-in method.";
    default:
      if (message.includes("Resend available")) return message;
      return message || fallback;
  }
}

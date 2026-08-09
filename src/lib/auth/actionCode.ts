/** Environment-aware Firebase email action return URL */
export function getAuthContinueUrl(path = "/dashboard"): string {
  const base =
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL) || "http://localhost:3000";
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base.replace(/\/$/, "")}${clean}`;
}

export function emailActionCodeSettings(continuePath = "/dashboard?verified=1") {
  return {
    url: getAuthContinueUrl(continuePath),
    handleCodeInApp: false as const,
  };
}

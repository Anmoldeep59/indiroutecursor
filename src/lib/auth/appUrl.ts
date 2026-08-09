/** Server-safe app origin for email links (never hardcode localhost in prod). */
export function getAppBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

export function absoluteAppUrl(path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${getAppBaseUrl()}${clean}`;
}

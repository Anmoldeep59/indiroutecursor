import { BrandLogo } from "@/components/brand/BrandLogo";

export function AuthSplash({ message = "Loading your account…" }: { message?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[color:var(--ivory)] px-4">
      <BrandLogo href={null} variant="dark" size="lg" />
      <div className="mt-6 h-1 w-32 overflow-hidden rounded-full bg-[color:var(--line)]">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-[color:var(--saffron)]" />
      </div>
      <p className="mt-4 text-sm text-[color:var(--ink-soft)]">{message}</p>
    </div>
  );
}

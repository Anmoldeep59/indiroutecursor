"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { BrandLogo } from "@/components/brand/BrandLogo";

export default function LoginPage() {
  const { login, configured } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      await login(String(form.get("email")), String(form.get("password")));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[color:var(--navy)]">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <BrandLogo href="/" />
        <div className="mt-8 rounded-xl bg-white p-6 shadow-xl">
          <h1 className="text-2xl font-bold text-[color:var(--navy)]">Log in</h1>
          <p className="mt-1 text-sm text-[color:var(--muted)]">Access your IndiRoute locker</p>
          {!configured ? (
            <p className="mt-4 rounded bg-amber-50 p-3 text-sm text-amber-900">
              Firebase client env vars are not configured.
            </p>
          ) : null}
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-[color:var(--muted)]">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-md border border-[color:var(--line)] px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-[color:var(--muted)]">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full rounded-md border border-[color:var(--line)] px-3 py-2.5 text-sm"
              />
            </div>
            {error ? (
              <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            ) : null}
            <button type="submit" disabled={pending || !configured} className="sp-btn-orange w-full">
              {pending ? "Signing in…" : "Log in"}
            </button>
          </form>
          <p className="mt-4 text-sm text-[color:var(--ink-soft)]">
            <Link href="/forgot-password" className="text-[color:var(--blue)]">
              Forgot password
            </Link>{" "}
            ·{" "}
            <Link href="/signup" className="text-[color:var(--blue)]">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

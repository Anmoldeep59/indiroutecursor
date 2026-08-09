"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { GuestOnly } from "@/components/auth/GuestOnly";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AuthSplash } from "@/components/auth/AuthSplash";
import { authErrorMessage } from "@/lib/auth/errors";

function LoginForm() {
  const { login, loginWithGoogle, configured } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      await login(String(form.get("email")), String(form.get("password")));
      const { getClientAuth } = await import("@/lib/firebase/client");
      const current = getClientAuth().currentUser;
      await current?.reload();
      // Password accounts must pass Resend OTP before dashboard
      if (current && !current.emailVerified) {
        router.replace("/verify-otp");
      } else {
        router.replace("/dashboard");
      }
    } catch (err) {
      console.error("[login]", err);
      setError(authErrorMessage(err, "Login failed"));
    } finally {
      setPending(false);
    }
  }

  async function onGoogle() {
    setPending(true);
    setError(null);
    try {
      await loginWithGoogle();
      // Google is verified by Firebase/Google — no Resend OTP
      router.replace("/dashboard");
    } catch (err) {
      console.error("[google-login]", err);
      setError(authErrorMessage(err, "Google sign-in failed"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[color:var(--navy)]">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <BrandLogo href="/" variant="light" />
        <div className="mt-8 rounded-xl bg-[color:var(--surface)] p-6 text-[color:var(--ink)] shadow-xl">
          <h1 className="text-2xl font-bold text-[color:var(--ink)]">Log in</h1>
          <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
            Access your India locker and shipments
          </p>
          {params.get("reset") === "1" ? (
            <p className="mt-3 rounded-md bg-[color:var(--india-green-soft)] px-3 py-2 text-sm text-[color:var(--india-green)]">
              Password updated. You can log in now.
            </p>
          ) : null}
          {params.get("verified") === "1" ? (
            <p className="mt-3 rounded-md bg-[color:var(--india-green-soft)] px-3 py-2 text-sm text-[color:var(--india-green)]">
              Email verified. Log in to open your dashboard and India address.
            </p>
          ) : null}
          {!configured ? (
            <p className="mt-4 rounded bg-amber-50 p-3 text-sm text-amber-950">
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
                className="w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2.5 text-sm text-[color:var(--ink)]"
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
                className="w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2.5 text-sm text-[color:var(--ink)]"
              />
            </div>
            {error ? (
              <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
            ) : null}
            <button type="submit" disabled={pending || !configured} className="sp-btn-orange w-full">
              {pending ? "Signing in…" : "Log in"}
            </button>
          </form>
          <div className="my-4 flex items-center gap-3 text-xs text-[color:var(--muted)]">
            <span className="h-px flex-1 bg-[color:var(--line)]" />
            or
            <span className="h-px flex-1 bg-[color:var(--line)]" />
          </div>
          <button
            type="button"
            disabled={pending || !configured}
            onClick={onGoogle}
            className="sp-btn-outline-navy w-full !text-sm"
          >
            Continue with Google
          </button>
          <p className="mt-4 text-sm text-[color:var(--ink-soft)]">
            <Link href="/forgot-password" className="text-[color:var(--chakra)]">
              Forgot password
            </Link>{" "}
            ·{" "}
            <Link href="/signup" className="text-[color:var(--chakra)]">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <GuestOnly>
      <Suspense fallback={<AuthSplash />}>
        <LoginForm />
      </Suspense>
    </GuestOnly>
  );
}

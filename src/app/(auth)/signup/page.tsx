"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { BrandLogo } from "@/components/brand/BrandLogo";

export default function SignupPage() {
  const { signup, configured } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    if (!form.get("accept")) {
      setError("Accept Terms and Prohibited items policy to continue.");
      setPending(false);
      return;
    }
    try {
      await signup(
        String(form.get("email")),
        String(form.get("password")),
        String(form.get("name")),
      );
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[color:var(--navy)]">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <BrandLogo href="/" />
        <div className="mt-8 rounded-xl bg-white p-6 shadow-xl">
          <h1 className="text-2xl font-bold text-[color:var(--navy)]">Sign up free</h1>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Get your Indian virtual address after email verification.
          </p>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-[color:var(--muted)]">
                Full name
              </label>
              <input name="name" required className="w-full rounded-md border border-[color:var(--line)] px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-[color:var(--muted)]">
                Email
              </label>
              <input name="email" type="email" required className="w-full rounded-md border border-[color:var(--line)] px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-[color:var(--muted)]">
                Password
              </label>
              <input name="password" type="password" minLength={8} required className="w-full rounded-md border border-[color:var(--line)] px-3 py-2.5 text-sm" />
            </div>
            <label className="flex items-start gap-2 text-sm text-[color:var(--ink-soft)]">
              <input type="checkbox" name="accept" className="mt-1" />
              <span>
                I agree to the <Link href="/terms" className="text-[color:var(--blue)]">Terms</Link>,{" "}
                <Link href="/privacy" className="text-[color:var(--blue)]">Privacy</Link>, and{" "}
                <Link href="/prohibited" className="text-[color:var(--blue)]">Prohibited items</Link>.
              </span>
            </label>
            {error ? (
              <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            ) : null}
            <button type="submit" disabled={pending || !configured} className="sp-btn-orange w-full">
              {pending ? "Creating…" : "Sign Up Free – Get Virtual Address"}
            </button>
          </form>
          <p className="mt-4 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[color:var(--blue)]">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

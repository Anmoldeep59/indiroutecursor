"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { GuestOnly } from "@/components/auth/GuestOnly";
import { BrandLogo } from "@/components/brand/BrandLogo";

export default function ForgotPasswordPage() {
  const { resetPassword, configured } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const email = String(new FormData(e.currentTarget).get("email"));
    try {
      await resetPassword(email);
    } catch (err) {
      console.error("[password-reset]", err);
      // Still show generic message to avoid enumeration
    }
    setMessage(
      "If an account exists for that email, a password reset link has been sent.",
    );
    setPending(false);
  }

  return (
    <GuestOnly>
      <div className="min-h-screen bg-[color:var(--navy)]">
        <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
          <BrandLogo href="/" variant="light" />
          <div className="mt-8 rounded-xl bg-[color:var(--surface)] p-6 text-[color:var(--ink)] shadow-xl">
            <h1 className="text-2xl font-bold">Reset password</h1>
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
              {message ? (
                <p className="rounded bg-[color:var(--india-green-soft)] px-3 py-2 text-sm text-[color:var(--india-green)]">
                  {message}
                </p>
              ) : null}
              <button type="submit" disabled={!configured || pending} className="sp-btn-orange w-full">
                {pending ? "Sending…" : "Send reset link"}
              </button>
            </form>
            <p className="mt-4 text-sm">
              <Link href="/login" className="text-[color:var(--chakra)]">
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </GuestOnly>
  );
}

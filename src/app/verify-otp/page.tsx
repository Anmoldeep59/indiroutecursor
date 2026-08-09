"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AuthSplash } from "@/components/auth/AuthSplash";
import { useAuth } from "@/components/auth/AuthProvider";
import { needsResendOtp } from "@/lib/auth/providers";

export default function VerifyOtpPage() {
  const {
    user,
    loading,
    configured,
    emailVerified,
    resendVerification,
    confirmOtp,
    logout,
  } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    try {
      const stored = Number(sessionStorage.getItem("ir_verify_resend_at") || 0);
      if (stored) {
        const left = Math.ceil((60_000 - (Date.now() - stored)) / 1000);
        if (left > 0) setSeconds(left);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  useEffect(() => {
    if (loading || !configured) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!needsResendOtp(user, emailVerified)) {
      router.replace("/dashboard");
    }
  }, [user, emailVerified, loading, configured, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setBusy(true);
    try {
      await confirmOtp(code);
      setMsg("Email verified. Opening your dashboard…");
      router.replace("/dashboard?verified=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  async function onResend() {
    setError(null);
    setMsg(null);
    setBusy(true);
    try {
      await resendVerification();
      setMsg("New code sent. Check your inbox and spam folder.");
      setSeconds(60);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not resend code";
      setError(message);
      const match = message.match(/(\d+) seconds/);
      if (match) setSeconds(Number(match[1]));
    } finally {
      setBusy(false);
    }
  }

  if (!configured || loading || !user) {
    return <AuthSplash message="Preparing verification…" />;
  }

  if (!needsResendOtp(user, emailVerified)) {
    return <AuthSplash message="Opening dashboard…" />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[color:var(--navy)] px-4">
      <BrandLogo href="/" variant="light" size="lg" />
      <div className="mt-8 w-full max-w-md rounded-xl bg-[color:var(--surface)] p-6 text-[color:var(--ink)] shadow-xl">
        <h1 className="text-xl font-bold">Enter verification code</h1>
        <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
          We sent a 6-digit code to <strong>{user.email}</strong> via IndiRoute
          (Resend). Enter it below to unlock your account.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-[color:var(--muted)]">
              One-time code
            </label>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-3 text-center text-2xl font-bold tracking-[0.35em] text-[color:var(--ink)]"
              placeholder="••••••"
            />
          </div>
          {error ? (
            <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}
          {msg ? (
            <p className="rounded bg-[color:var(--india-green-soft)] px-3 py-2 text-sm text-[color:var(--india-green)]">
              {msg}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy || code.length !== 6}
            className="sp-btn-orange w-full"
          >
            {busy ? "Verifying…" : "Verify & continue"}
          </button>
        </form>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
          <button
            type="button"
            disabled={busy || seconds > 0}
            onClick={onResend}
            className="font-semibold text-[color:var(--chakra)] disabled:opacity-50"
          >
            {seconds > 0 ? `Resend in ${seconds}s` : "Resend code"}
          </button>
          <button
            type="button"
            className="text-[color:var(--ink-soft)]"
            onClick={() => void logout().then(() => router.replace("/login"))}
          >
            Use a different account
          </button>
        </div>
        <p className="mt-6 text-xs text-[color:var(--muted)]">
          Google sign-in skips this step (verified by Google). Password accounts
          must verify with Resend OTP.{" "}
          <Link href="/login" className="text-[color:var(--chakra)]">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

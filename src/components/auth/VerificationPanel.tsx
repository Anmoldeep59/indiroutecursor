"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

const COOLDOWN = 60;

export function VerificationPanel() {
  const { user, emailVerified, resendVerification, refreshVerification } = useAuth();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState(false);

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

  if (!user || emailVerified) return null;

  async function onResend() {
    setMsg(null);
    setErr(null);
    setBusy(true);
    try {
      await resendVerification();
      setMsg("Verification email sent. Check your inbox and spam folder.");
      setSeconds(COOLDOWN);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not send verification email";
      setErr(message);
      const match = message.match(/(\d+) seconds/);
      if (match) setSeconds(Number(match[1]));
    } finally {
      setBusy(false);
    }
  }

  async function onCheck() {
    setMsg(null);
    setErr(null);
    setBusy(true);
    try {
      const ok = await refreshVerification();
      if (ok) {
        setMsg("Email verified. Your IND ID and warehouse address are being unlocked.");
      } else {
        setErr("Not verified yet. Open the link in your email, then try again.");
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not refresh verification");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-amber-300 bg-[#fff8eb] p-5 text-[color:var(--ink)] shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-amber-950">Verify your email to unlock IndiRoute</p>
          <p className="mt-1 text-sm text-amber-950/80">
            We sent a verification link to <strong>{user.email}</strong>. Your IND ID and India
            warehouse address stay hidden until you verify.
          </p>
        </div>
        <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-950">
          Action required
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || seconds > 0}
          onClick={onResend}
          className="rounded-md bg-[color:var(--saffron)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {seconds > 0 ? `Resend available in ${seconds}s` : "Resend verification"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onCheck}
          className="rounded-md bg-[color:var(--navy)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          I&apos;ve verified my email
        </button>
      </div>
      {msg ? (
        <p className="mt-3 rounded-md bg-[color:var(--india-green-soft)] px-3 py-2 text-sm text-[color:var(--india-green)]">
          {msg}
        </p>
      ) : null}
      {err ? (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{err}</p>
      ) : null}
    </div>
  );
}

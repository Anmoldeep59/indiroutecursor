"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

const COOLDOWN = 60;

/** Fallback OTP UI if an unverified password user reaches the dashboard. */
export function VerificationPanel() {
  const { user, emailVerified, needsOtp, resendVerification, confirmOtp } =
    useAuth();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user && needsOtp) {
      router.replace("/verify-otp");
    }
  }, [user, needsOtp, router]);

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

  if (!user || emailVerified || !needsOtp) return null;

  async function onResend() {
    setMsg(null);
    setErr(null);
    setBusy(true);
    try {
      await resendVerification();
      setMsg("New code sent. Check inbox and spam.");
      setSeconds(COOLDOWN);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not send code";
      setErr(message);
      const match = message.match(/(\d+) seconds/);
      if (match) setSeconds(Number(match[1]));
    } finally {
      setBusy(false);
    }
  }

  async function onVerify() {
    setMsg(null);
    setErr(null);
    setBusy(true);
    try {
      await confirmOtp(code);
      setMsg("Email verified. Unlocking your IND ID…");
      router.replace("/dashboard?verified=1");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Incorrect code");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-amber-300 bg-[#fff8eb] p-5 text-[color:var(--ink)] shadow-sm">
      <p className="text-sm font-bold text-amber-950">
        Enter the Resend OTP sent to {user.email}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          className="w-40 rounded-md border border-amber-400 bg-white px-3 py-2 text-center text-lg font-bold tracking-widest"
          placeholder="000000"
        />
        <button
          type="button"
          disabled={busy || code.length !== 6}
          onClick={onVerify}
          className="sp-btn-navy !px-4 !py-2 !text-sm"
        >
          Verify code
        </button>
        <button
          type="button"
          disabled={busy || seconds > 0}
          onClick={onResend}
          className="sp-btn-orange !px-4 !py-2 !text-sm"
        >
          {seconds > 0 ? `Resend in ${seconds}s` : "Resend code"}
        </button>
      </div>
      {msg ? (
        <p className="mt-3 text-sm text-[color:var(--india-green)]">{msg}</p>
      ) : null}
      {err ? <p className="mt-3 text-sm text-red-800">{err}</p> : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AuthSplash } from "@/components/auth/AuthSplash";
import { useAuth } from "@/components/auth/AuthProvider";

function VerifyEmailInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { refreshVerification, user } = useAuth();
  const token = params.get("token") || "";
  const [status, setStatus] = useState<"working" | "ok" | "error">("working");
  const [message, setMessage] = useState("Verifying your email…");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token. Open the link from your email.");
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/auth/confirm-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Verification failed");
          return;
        }
        setStatus("ok");
        setMessage("Email verified. Unlocking your IndiRoute ID…");
        // Refresh client Firebase state if signed in
        if (user) {
          await refreshVerification();
        }
        setTimeout(() => {
          router.replace(user ? "/dashboard?verified=1" : "/login?verified=1");
        }, 900);
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Network error while verifying. Try again.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, router, refreshVerification, user]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[color:var(--ivory)] px-4">
      <BrandLogo href="/" variant="dark" size="lg" />
      <div className="mt-8 w-full max-w-md rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 text-center shadow-sm">
        <h1 className="text-xl font-bold text-[color:var(--ink)]">Email verification</h1>
        <p
          className={`mt-3 text-sm ${
            status === "error"
              ? "text-red-700"
              : status === "ok"
                ? "text-[color:var(--india-green)]"
                : "text-[color:var(--ink-soft)]"
          }`}
        >
          {message}
        </p>
        {status === "error" ? (
          <div className="mt-6 flex flex-col gap-2">
            <Link href="/login" className="sp-btn-navy !text-sm">
              Go to login
            </Link>
            <Link href="/dashboard" className="text-sm text-[color:var(--chakra)]">
              Open dashboard &amp; resend
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthSplash message="Opening verification…" />}>
      <VerifyEmailInner />
    </Suspense>
  );
}

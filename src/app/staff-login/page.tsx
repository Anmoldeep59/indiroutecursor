"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Alert, Button, Input, Label, Panel } from "@/components/ui/ui";
import { authErrorMessage } from "@/lib/auth/errors";
import { getClientAuth } from "@/lib/firebase/client";

export default function StaffLoginPage() {
  const { login, logout, configured, staff, user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        await fetch("/api/admin/bootstrap", { method: "POST" });
      } catch {
        /* ignore */
      } finally {
        setBootstrapped(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (loading || pending) return;
    if (user && staff?.active) {
      router.replace("/admin");
    }
  }, [user, staff, loading, pending, router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    try {
      await login(String(form.get("email")), String(form.get("password")));

      const current = getClientAuth().currentUser;
      if (!current) {
        setError("Login failed");
        return;
      }

      // Admin SDK session check — no client Firestore staff read required
      const token = await current.getIdToken(true);
      const res = await fetch("/api/admin/session", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.isStaff) {
        await logout();
        setError(
          data.error === "Unauthorized"
            ? "Login failed"
            : "This account is not an IndiRoute admin. Use the customer login.",
        );
        return;
      }

      router.replace("/admin");
    } catch (err) {
      setError(authErrorMessage(err, "Login failed"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <div className="w-full max-w-md">
        <BrandLogo href="/" variant="light" />
        <h1 className="mt-6 text-2xl font-semibold">IndiRoute Admin</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Single founder admin login. No email verification code required.
        </p>
        <Panel className="mt-6 !border-zinc-700 !bg-zinc-900 !text-zinc-100">
          <form className="space-y-3" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="email">Admin email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="username"
                className="!bg-white !text-[color:var(--ink)]"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="!bg-white !text-[color:var(--ink)]"
              />
            </div>
            {error ? <Alert tone="danger">{error}</Alert> : null}
            <Button
              type="submit"
              disabled={!configured || pending || !bootstrapped}
              className="w-full"
              variant="navy"
            >
              {pending ? "Signing in…" : "Sign in to admin"}
            </Button>
          </form>
        </Panel>
      </div>
    </div>
  );
}

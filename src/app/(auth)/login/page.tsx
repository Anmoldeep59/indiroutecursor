"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Alert, Button, Input, Label, Panel } from "@/components/ui/ui";

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
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-[color:var(--wash)] px-4 py-12">
      <Link href="/" className="text-2xl font-bold text-[color:var(--navy)]">
        Indi<span className="text-[color:var(--orange)]">Route</span>
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-[color:var(--navy)]">Login</h1>
      {!configured ? (
        <div className="mt-4">
          <Alert tone="warn">Firebase client env vars are not configured.</Alert>
        </div>
      ) : null}
      <Panel className="mt-6">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {error ? <Alert tone="danger">{error}</Alert> : null}
          <Button type="submit" disabled={pending || !configured} className="w-full">
            {pending ? "Signing in…" : "Log in"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-[color:var(--muted)]">
          <Link href="/forgot-password">Forgot password</Link> ·{" "}
          <Link href="/signup">Create account</Link>
        </p>
      </Panel>
    </div>
  );
}

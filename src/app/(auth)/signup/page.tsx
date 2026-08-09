"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Alert, Button, Input, Label, Panel } from "@/components/ui/ui";

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
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-[color:var(--wash)] px-4 py-12">
      <Link href="/" className="text-2xl font-bold text-[color:var(--navy)]">
        Indi<span className="text-[color:var(--orange)]">Route</span>
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-[color:var(--navy)]">Sign up for free</h1>
      <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
        Verify your email to unlock your permanent IND ID and warehouse address.
      </p>
      <Panel className="mt-6">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" minLength={8} required />
          </div>
          <label className="flex items-start gap-2 text-sm text-[color:var(--ink-soft)]">
            <input type="checkbox" name="accept" className="mt-1" />
            <span>
              I agree to the <Link href="/terms">Terms</Link>,{" "}
              <Link href="/privacy">Privacy Policy</Link>, and{" "}
              <Link href="/prohibited">Prohibited items</Link> rules.
            </span>
          </label>
          {error ? <Alert tone="danger">{error}</Alert> : null}
          <Button type="submit" disabled={pending || !configured} className="w-full">
            {pending ? "Creating…" : "Sign up"}
          </Button>
        </form>
        <p className="mt-4 text-sm">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </Panel>
    </div>
  );
}

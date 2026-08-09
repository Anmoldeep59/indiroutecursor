"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Alert, Button, Input, Label, Panel } from "@/components/ui/ui";

export default function ForgotPasswordPage() {
  const { resetPassword, configured } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const email = String(new FormData(e.currentTarget).get("email"));
    try {
      await resetPassword(email);
      setMessage("Password reset email sent if the account exists.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <Link href="/" className="font-[family-name:var(--font-display)] text-2xl">
        IndiRoute
      </Link>
      <h1 className="mt-6 text-3xl font-[family-name:var(--font-display)]">Reset password</h1>
      <Panel className="mt-6">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          {message ? <Alert tone="success">{message}</Alert> : null}
          {error ? <Alert tone="danger">{error}</Alert> : null}
          <Button type="submit" disabled={!configured} className="w-full">
            Send reset link
          </Button>
        </form>
        <p className="mt-4 text-sm">
          <Link href="/login">Back to login</Link>
        </p>
      </Panel>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Alert, Button, Input, Label, Panel } from "@/components/ui/ui";
import { authErrorMessage } from "@/lib/auth/errors";

export default function StaffLoginPage() {
  const { login, configured } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      await login(String(form.get("email")), String(form.get("password")));
      router.push("/admin");
    } catch (err) {
      setError(authErrorMessage(err, "Login failed"));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <div className="w-full max-w-md">
        <BrandLogo href="/" variant="light" />
        <h1 className="mt-6 text-2xl font-semibold">IndiRoute Admin</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Staff accounts only (Warehouse Staff or Super Admin). No shared passwords.
        </p>
        <Panel className="mt-6 !border-zinc-700 !bg-zinc-900 !text-zinc-100">
          <form className="space-y-3" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {error ? <Alert tone="danger">{error}</Alert> : null}
            <Button type="submit" disabled={!configured} className="w-full">
              Sign in
            </Button>
          </form>
        </Panel>
      </div>
    </div>
  );
}

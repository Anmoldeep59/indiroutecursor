"use client";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Alert, Button, Input, Label, PageTitle, Panel } from "@/components/ui/ui";

export default function SecurityPage() {
  const { changePassword } = useAuth();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null); setErr(null);
    const form = new FormData(e.currentTarget);
    try {
      await changePassword(String(form.get("current")), String(form.get("next")));
      setMsg("Password updated.");
      e.currentTarget.reset();
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Failed");
    }
  }
  return (
    <div>
      <PageTitle title="Security" subtitle="Password change requires re-authentication. Email change is deferred in Beta unless founder enables it." />
      <Panel>
        <form className="max-w-md space-y-3" onSubmit={onSubmit}>
          <div><Label>Current password</Label><Input name="current" type="password" required /></div>
          <div><Label>New password</Label><Input name="next" type="password" minLength={8} required /></div>
          <Button type="submit">Update password</Button>
        </form>
        {msg ? <div className="mt-3"><Alert tone="success">{msg}</Alert></div> : null}
        {err ? <div className="mt-3"><Alert tone="danger">{err}</Alert></div> : null}
      </Panel>
    </div>
  );
}

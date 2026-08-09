"use client";

import { useState } from "react";
import { Alert, Button, Input, Label, PageTitle, Panel } from "@/components/ui/ui";

export default function ContactPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setStatus(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        message: form.get("message"),
      }),
    });
    setPending(false);
    setStatus(res.ok ? "Message sent. We will reply by email." : "Could not send. Try again later.");
    if (res.ok) e.currentTarget.reset();
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 md:px-6">
      <PageTitle title="Contact" subtitle="Email us about Beta shipping to Australia." />
      <Panel>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              className="w-full rounded-md border border-[color:var(--line)] px-3 py-2 text-sm"
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Sending…" : "Send"}
          </Button>
        </form>
        {status ? <div className="mt-4"><Alert>{status}</Alert></div> : null}
      </Panel>
    </div>
  );
}

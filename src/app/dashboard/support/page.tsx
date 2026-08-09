"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthProvider";
import { useApi } from "@/lib/hooks/useApi";
import { Alert, Button, Input, Label, PageTitle, Panel } from "@/components/ui/ui";
import { getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { SupportTicket } from "@/lib/types";

export default function SupportPage() {
  const { user } = useAuth();
  const { api } = useApi();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseClientConfigured() || !user) return;
    const q = query(
      collection(getClientDb(), COLLECTIONS.supportTickets),
      where("userId", "==", user.uid),
      orderBy("updatedAt", "desc"),
    );
    return onSnapshot(q, (snap) =>
      setTickets(snap.docs.map((d) => d.data() as SupportTicket)),
    );
  }, [user]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    const form = new FormData(e.currentTarget);
    try {
      await api("/api/support", {
        method: "POST",
        json: {
          category: form.get("category"),
          subject: form.get("subject"),
          message: form.get("message"),
        },
      });
      setMsg("Ticket created.");
      e.currentTarget.reset();
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Failed");
    }
  }

  return (
    <div>
      <PageTitle title="Support" />
      <Panel>
        <form className="space-y-3" onSubmit={onSubmit}>
          <div>
            <Label>Category</Label>
            <select
              name="category"
              className="w-full rounded-md border border-[color:var(--line)] px-3 py-2 text-sm"
              defaultValue="other"
            >
              {[
                "package_not_showing",
                "package_damaged",
                "tracking",
                "shipping",
                "payment",
                "consolidation",
                "customs",
                "refund",
                "account",
                "technical",
                "other",
              ].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Subject</Label>
            <Input name="subject" required />
          </div>
          <div>
            <Label>Message</Label>
            <textarea
              name="message"
              required
              rows={4}
              className="w-full rounded-md border border-[color:var(--line)] px-3 py-2 text-sm"
            />
          </div>
          <Button type="submit">Open ticket</Button>
        </form>
        {msg ? <div className="mt-3"><Alert tone="success">{msg}</Alert></div> : null}
        {err ? <div className="mt-3"><Alert tone="danger">{err}</Alert></div> : null}
      </Panel>
      <Panel className="mt-4">
        <h2 className="font-medium">Your tickets</h2>
        <ul className="mt-3 space-y-3 text-sm">
          {tickets.map((t) => (
            <li key={t.id} className="border-t border-[color:var(--line)] pt-3">
              <p className="font-medium">
                {t.subject} · {t.status} · {t.priority}
              </p>
              <p className="text-[color:var(--muted)]">{t.messages.at(-1)?.body}</p>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

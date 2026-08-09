"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy, limit } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageTitle, Panel } from "@/components/ui/ui";
import { getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { NotificationRecord } from "@/lib/types";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationRecord[]>([]);
  useEffect(() => {
    if (!isFirebaseClientConfigured() || !user) return;
    const q = query(
      collection(getClientDb(), COLLECTIONS.notifications),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    return onSnapshot(q, (snap) =>
      setItems(snap.docs.map((d) => d.data() as NotificationRecord)),
    );
  }, [user]);

  return (
    <div>
      <PageTitle title="Notifications" />
      <Panel>
        <ul className="space-y-3 text-sm">
          {items.map((n) => (
            <li key={n.id} className="border-b border-[color:var(--line)] pb-3">
              <p className="font-medium">{n.title}</p>
              <p className="text-[color:var(--muted)]">{n.body}</p>
            </li>
          ))}
          {items.length === 0 ? (
            <li className="text-[color:var(--muted)]">No notifications yet.</li>
          ) : null}
        </ul>
      </Panel>
    </div>
  );
}

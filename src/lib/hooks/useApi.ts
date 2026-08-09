"use client";

import { useAuth } from "@/components/auth/AuthProvider";

export function useApi() {
  const { getIdToken } = useAuth();

  async function api<T>(
    path: string,
    init?: RequestInit & { json?: unknown },
  ): Promise<T> {
    const token = await getIdToken();
    const headers = new Headers(init?.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (init?.json !== undefined) {
      headers.set("Content-Type", "application/json");
    }
    const res = await fetch(path, {
      ...init,
      headers,
      body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data as T;
  }

  return { api };
}

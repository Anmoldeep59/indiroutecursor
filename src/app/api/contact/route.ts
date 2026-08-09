import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(3).max(5000),
});

const hits = new Map<string, { count: number; reset: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const row = hits.get(ip);
  if (!row || now > row.reset) {
    hits.set(ip, { count: 1, reset: now + 60_000 });
    return true;
  }
  if (row.count >= 5) return false;
  row.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const body = schema.parse(await req.json());
  // Basic XSS mitigation: store plain text only
  const clean = {
    name: body.name.replace(/[<>]/g, ""),
    email: body.email,
    message: body.message.replace(/[<>]/g, ""),
  };
  if (isAdminConfigured()) {
    const id = randomUUID();
    await adminDb()
      .collection(COLLECTIONS.contactMessages)
      .doc(id)
      .set({ id, ...clean, createdAt: new Date().toISOString(), ip });
  }
  return NextResponse.json({ ok: true });
}

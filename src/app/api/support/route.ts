import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { requireCustomer, requireStaff } from "@/lib/server/auth";
import { notifyUser } from "@/lib/server/notifications";
import type { SupportTicket } from "@/lib/types";

const createSchema = z.object({
  category: z.enum([
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
  ]),
  subject: z.string().min(3).max(120),
  message: z.string().min(3).max(5000),
});

function priorityFor(
  category: SupportTicket["category"],
): SupportTicket["priority"] {
  if (category === "package_damaged" || category === "payment" || category === "refund") {
    return "p0";
  }
  if (
    category === "tracking" ||
    category === "shipping" ||
    category === "consolidation" ||
    category === "customs"
  ) {
    return "p1";
  }
  return "p2";
}

export async function POST(req: NextRequest) {
  try {
    const { identity, profile } = await requireCustomer(
      req.headers.get("authorization"),
    );
    const body = createSchema.parse(await req.json());
    const now = new Date().toISOString();
    const id = randomUUID();
    const ticket: SupportTicket = {
      id,
      userId: identity.uid,
      category: body.category,
      subject: body.subject,
      status: "open",
      priority: priorityFor(body.category),
      messages: [
        {
          id: randomUUID(),
          authorId: identity.uid,
          authorRole: "customer",
          body: body.message,
          createdAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    await adminDb().collection(COLLECTIONS.supportTickets).doc(id).set(ticket);
    await notifyUser({
      userId: identity.uid,
      email: profile.email,
      type: "support_update",
      title: "Support ticket created",
      body: `We received: ${body.subject}`,
      entityType: "supportTicket",
      entityId: id,
      sendEmail: true,
    });
    return NextResponse.json({ ticket });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(error);
    return NextResponse.json({ error: "Ticket create failed" }, { status: 500 });
  }
}

const replySchema = z.object({
  ticketId: z.string(),
  message: z.string().min(1).max(5000),
  status: z.enum(["open", "pending", "resolved", "closed"]).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    // Staff reply path
    try {
      const { identity, staff } = await requireStaff(authHeader);
      const body = replySchema.parse(await req.json());
      const ref = adminDb().collection(COLLECTIONS.supportTickets).doc(body.ticketId);
      const snap = await ref.get();
      if (!snap.exists) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const ticket = snap.data() as SupportTicket;
      const now = new Date().toISOString();
      const messages = [
        ...ticket.messages,
        {
          id: randomUUID(),
          authorId: identity.uid,
          authorRole: "staff" as const,
          body: body.message,
          createdAt: now,
        },
      ];
      await ref.update({
        messages,
        status: body.status ?? "pending",
        updatedAt: now,
      });
      const user = (
        await adminDb().collection(COLLECTIONS.users).doc(ticket.userId).get()
      ).data();
      await notifyUser({
        userId: ticket.userId,
        email: user?.email,
        type: "support_update",
        title: "Support reply",
        body: body.message.slice(0, 200),
        entityType: "supportTicket",
        entityId: ticket.id,
      });
      void staff;
      return NextResponse.json({ ok: true });
    } catch {
      // fall through to customer
    }

    const { identity } = await requireCustomer(authHeader);
    const body = replySchema.parse(await req.json());
    const ref = adminDb().collection(COLLECTIONS.supportTickets).doc(body.ticketId);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const ticket = snap.data() as SupportTicket;
    if (ticket.userId !== identity.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const now = new Date().toISOString();
    await ref.update({
      messages: [
        ...ticket.messages,
        {
          id: randomUUID(),
          authorId: identity.uid,
          authorRole: "customer",
          body: body.message,
          createdAt: now,
        },
      ],
      status: "open",
      updatedAt: now,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(error);
    return NextResponse.json({ error: "Reply failed" }, { status: 500 });
  }
}

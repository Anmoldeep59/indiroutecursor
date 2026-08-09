import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import {
  emailShell,
  sendTransactionalEmail,
  type EmailEvent,
} from "@/lib/email/resend";
import { randomUUID } from "crypto";

export async function notifyUser(input: {
  userId: string;
  email?: string;
  type: EmailEvent | string;
  title: string;
  body: string;
  sendEmail?: boolean;
  entityType?: string;
  entityId?: string;
}): Promise<void> {
  const id = randomUUID();
  const doc: Record<string, unknown> = {
    id,
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    read: false,
    createdAt: new Date().toISOString(),
  };
  if (input.entityType) doc.entityType = input.entityType;
  if (input.entityId) doc.entityId = input.entityId;

  await adminDb().collection(COLLECTIONS.notifications).doc(id).set(doc);

  if (input.sendEmail !== false && input.email) {
    try {
      await sendTransactionalEmail({
        to: input.email,
        event: input.type as EmailEvent,
        subject: input.title,
        html: emailShell(input.title, `<p>${input.body}</p>`),
      });
    } catch (err) {
      // Never block auth/profile activation on outbound email provider issues
      console.error("[notifyUser] transactional email failed", err);
    }
  }
}

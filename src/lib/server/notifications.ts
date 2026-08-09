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
  await adminDb()
    .collection(COLLECTIONS.notifications)
    .doc(id)
    .set({
      id,
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      read: false,
      entityType: input.entityType,
      entityId: input.entityId,
      createdAt: new Date().toISOString(),
    });

  if (input.sendEmail !== false && input.email) {
    await sendTransactionalEmail({
      to: input.email,
      event: input.type as EmailEvent,
      subject: input.title,
      html: emailShell(input.title, `<p>${input.body}</p>`),
    });
  }
}

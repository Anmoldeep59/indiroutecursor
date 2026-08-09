import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { AuditLog } from "@/lib/types";
import { randomUUID } from "crypto";

export async function writeAuditLog(input: {
  actorId: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
}): Promise<void> {
  const id = randomUUID();
  const entry: AuditLog = {
    id,
    ...input,
    createdAt: new Date().toISOString(),
  };
  await adminDb().collection(COLLECTIONS.auditLogs).doc(id).set(entry);
}

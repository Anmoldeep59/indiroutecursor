import { Resend } from "resend";
import { getFounderSettings } from "@/lib/config/founder-settings";

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

export type EmailEvent =
  | "welcome"
  | "verify_email"
  | "password_reset"
  | "package_received"
  | "action_required"
  | "consolidation_started"
  | "consolidation_completed"
  | "payment_successful"
  | "payment_failed"
  | "package_shipped"
  | "tracking_update"
  | "delivered"
  | "storage_warning"
  | "storage_charges_started"
  | "refund_issued"
  | "support_update"
  | "package_opened"
  | "damaged_exception";

export async function sendTransactionalEmail(input: {
  to: string;
  event: EmailEvent;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; skipped?: boolean; id?: string }> {
  const client = getResend();
  if (!client) {
    console.info("[email:skipped]", input.event, input.to, input.subject);
    return { ok: true, skipped: true };
  }
  const settings = getFounderSettings();
  const result = await client.emails.send({
    from: settings.resendFromEmail,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });
  return { ok: !result.error, id: result.data?.id };
}

export function emailShell(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html><html><body style="font-family:Georgia,serif;color:#1a2e28;background:#f3f6f4;padding:24px">
  <table width="100%" style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #d5e0db;padding:24px">
    <tr><td><p style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#0f6b4c;margin:0 0 8px">IndiRoute</p>
    <h1 style="font-size:22px;margin:0 0 16px">${title}</h1>
    ${bodyHtml}
    <p style="font-size:12px;color:#5c6f68;margin-top:24px">Shop in India. We deliver worldwide.</p>
    </td></tr>
  </table></body></html>`;
}

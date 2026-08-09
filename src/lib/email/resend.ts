import { Resend } from "resend";
import { getFounderSettings } from "@/lib/config/founder-settings";

const DEFAULT_FROM = "IndiRoute <no-reply@indiroute.co>";

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

function formatResendError(error: unknown): string {
  if (!error || typeof error !== "object") return "Resend send failed";
  const e = error as { message?: string; name?: string; statusCode?: number };
  const message = e.message || "Resend send failed";
  const lower = message.toLowerCase();
  if (
    lower.includes("domain") ||
    lower.includes("not verified") ||
    lower.includes("from address") ||
    lower.includes("invalid `from`")
  ) {
    return (
      `Resend sender/domain not verified for ${DEFAULT_FROM}. ` +
      `Verify indiroute.co in the Resend dashboard. Details: ${message}`
    );
  }
  return message;
}

export async function sendTransactionalEmail(input: {
  to: string;
  event: EmailEvent;
  subject: string;
  html: string;
  /** Override From; verification always uses IndiRoute no-reply */
  from?: string;
}): Promise<{ ok: boolean; skipped?: boolean; id?: string; error?: string }> {
  const client = getResend();
  if (!client) {
    console.error("[email] RESEND_API_KEY missing — refusing send", {
      event: input.event,
      to: input.to,
    });
    return {
      ok: false,
      skipped: true,
      error:
        "Email delivery is not configured (RESEND_API_KEY). Add it to server env and retry.",
    };
  }

  const settings = getFounderSettings();
  const from =
    input.event === "verify_email"
      ? DEFAULT_FROM
      : input.from || settings.resendFromEmail || DEFAULT_FROM;

  const result = await client.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });

  if (result.error) {
    const error = formatResendError(result.error);
    console.error("[email] Resend API error", {
      event: input.event,
      to: input.to,
      from,
      error: result.error,
    });
    return { ok: false, error };
  }

  const id = result.data?.id;
  // Always log message ID for verification; all events in development
  if (input.event === "verify_email" || process.env.NODE_ENV === "development") {
    console.info("[email] Resend message ID", {
      event: input.event,
      id: id ?? null,
      to: input.to,
      from,
    });
  }

  return { ok: true, id };
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

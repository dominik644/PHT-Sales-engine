import { getDemoMode } from "@/lib/env";

export type MailPayload = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
};

export type MailResult = {
  ok: boolean;
  demo: boolean;
  id?: string;
  error?: string;
};

/**
 * Mail-Adapter:
 * - DEMO / ohne SMTP: loggt nach stdout (sichtbar in Server-Logs)
 * - Optional MAIL_WEBHOOK_URL: POST JSON an Webhook (z. B. Zapier/Resend-Proxy)
 * - Optional SMTP_* via nodemailer, falls Dependency vorhanden
 */
export async function sendMail(payload: MailPayload): Promise<MailResult> {
  const to = Array.isArray(payload.to) ? payload.to.join(", ") : payload.to;
  const demo = getDemoMode() || !process.env.MAIL_WEBHOOK_URL && !process.env.SMTP_HOST;

  if (process.env.MAIL_WEBHOOK_URL) {
    try {
      const res = await fetch(process.env.MAIL_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.MAIL_WEBHOOK_TOKEN
            ? { Authorization: `Bearer ${process.env.MAIL_WEBHOOK_TOKEN}` }
            : {}),
        },
        body: JSON.stringify({
          to,
          subject: payload.subject,
          text: payload.text,
          html: payload.html,
        }),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        console.error("[mail:webhook]", res.status, detail.slice(0, 300));
        return { ok: false, demo: false, error: `webhook ${res.status}` };
      }
      return { ok: true, demo: false, id: `webhook-${Date.now()}` };
    } catch (error) {
      const message = error instanceof Error ? error.message : "webhook_failed";
      console.error("[mail:webhook]", message);
      return { ok: false, demo: false, error: message };
    }
  }

  if (process.env.SMTP_HOST) {
    try {
      // Optional dependency — resolve at runtime without a hard package requirement.
      const load = new Function(
        "specifier",
        "return import(specifier)",
      ) as (specifier: string) => Promise<{
        createTransport: (opts: Record<string, unknown>) => {
          sendMail: (msg: Record<string, unknown>) => Promise<{ messageId?: string }>;
        };
      }>;
      const nodemailer = await load("nodemailer").catch(() => null);
      if (!nodemailer) {
        console.warn(
          "[mail] SMTP_HOST set but nodemailer not installed — falling back to demo log",
        );
      } else {
        const transport = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT ?? 587),
          secure: process.env.SMTP_SECURE === "true",
          auth:
            process.env.SMTP_USER && process.env.SMTP_PASS
              ? {
                  user: process.env.SMTP_USER,
                  pass: process.env.SMTP_PASS,
                }
              : undefined,
        });
        const info = await transport.sendMail({
          from: process.env.MAIL_FROM ?? "noreply@pht.local",
          to,
          subject: payload.subject,
          text: payload.text,
          html: payload.html,
        });
        return { ok: true, demo: false, id: info.messageId };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "smtp_failed";
      console.error("[mail:smtp]", message);
      return { ok: false, demo: false, error: message };
    }
  }

  console.info(
    JSON.stringify({
      channel: "mail:demo",
      to,
      subject: payload.subject,
      text: payload.text.slice(0, 500),
      ts: new Date().toISOString(),
      demo,
    }),
  );
  return { ok: true, demo: true, id: `demo-${Date.now()}` };
}

export function mailEnabled(): boolean {
  return Boolean(process.env.MAIL_WEBHOOK_URL || process.env.SMTP_HOST) || getDemoMode();
}

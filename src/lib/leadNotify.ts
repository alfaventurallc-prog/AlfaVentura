import nodemailer from "nodemailer";
import { BUSINESS, SITE_URL } from "./seo";

// Emails every new lead (contact form, quote, sample request) to the team.
// Configured only through environment variables, so it is off until they are
// set in Vercel:
//   SMTP_HOST, SMTP_PORT (465 default), SMTP_USER, SMTP_PASS,
//   LEAD_NOTIFY_TO (optional, comma-separated; defaults to the site's info@ address),
//   SMTP_FROM (optional, defaults to SMTP_USER)
// Works with any SMTP server, e.g. Gmail with an App Password
// (smtp.gmail.com:465), Zoho Mail on a plan with SMTP (smtp.zoho.in:465) or a
// free Resend account (smtp.resend.com:465).

const SEND_TIMEOUT_MS = 8000;

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export interface Lead {
  /** e.g. "Quote request", "Sample request", "Contact form" */
  kind: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  product?: { title: string; path: string };
  message: string;
}

/** Sends the notification; never throws, so a mail problem can't fail the
 * form for the visitor (the lead is already saved in the database). */
export async function notifyLead(lead: Lead) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  const to = process.env.LEAD_NOTIFY_TO || BUSINESS.email;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return;

  const port = Number(SMTP_PORT) || 465;
  const rows: [string, string | undefined][] = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Company", lead.company],
    ["Product", lead.product && `${lead.product.title} - ${SITE_URL}${lead.product.path}`],
  ];
  const filled = rows.filter((r): r is [string, string] => !!r[1]);
  const text = [...filled.map(([k, v]) => `${k}: ${v}`), "", lead.message].join("\n");
  const html = `<h2 style="font-family:sans-serif">New ${escapeHtml(lead.kind.toLowerCase())} from alfa-ventura.com</h2>
<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">${filled
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${k}</td><td style="padding:4px 0">${escapeHtml(v)}</td></tr>`)
    .join("")}</table>
<p style="font-family:sans-serif;font-size:14px;white-space:pre-line;border-top:1px solid #ddd;padding-top:12px">${escapeHtml(lead.message)}</p>`;

  try {
    const transport = nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });
    await Promise.race([
      transport.sendMail({
        from: SMTP_FROM || SMTP_USER,
        to,
        replyTo: `${lead.name.replace(/["<>]/g, "")} <${lead.email}>`,
        subject: `New ${lead.kind}: ${lead.name}${lead.product ? ` - ${lead.product.title}` : ""}`,
        text,
        html,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("SMTP timeout")), SEND_TIMEOUT_MS)),
    ]);
  } catch (error) {
    console.error("Lead notification email failed:", error);
  }
}

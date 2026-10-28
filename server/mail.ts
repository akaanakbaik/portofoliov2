import nodemailer from "nodemailer";
import { db } from "./backend";
export function emailConfigured() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
}
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export async function deliverMessage(id?: string) {
  if (!emailConfigured()) return { configured: false };
  const message = await db("contact.claim", id ? { id } : {});
  if (!message.id) return { empty: true };
  try {
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      connectionTimeout: 8000,
      socketTimeout: 10000,
      tls: { rejectUnauthorized: true },
    });
    try {
      await transport.sendMail({
        from: { name: "Portfolio aka", address: process.env.EMAIL_USER! },
        to: process.env.EMAIL_RECIPIENT || process.env.EMAIL_USER,
        replyTo: message.email,
        subject: `Pesan dari ${message.name} — Portfolio aka`,
        text: `${message.name} <${message.email}>\n\n${message.message}`,
        html: `<h2>Pesan baru — Portfolio aka</h2><p>${escape(message.name)} &lt;${escape(message.email)}&gt;</p><p style="white-space:pre-wrap">${escape(message.message)}</p>`,
        messageId: `<${message.id}@akaa.dev>`,
      });
    } finally {
      transport.close();
    }
    await db("contact.delivered", { id: message.id, ok: true });
    return { sent: true };
  } catch (error) {
    console.error(
      "[email] Delivery failed",
      error instanceof Error ? error.name : "Error",
    );
    await db("contact.delivered", {
      id: message.id,
      ok: false,
      error: "Email delivery failed; retry scheduled",
    });
    return { sent: false };
  }
}

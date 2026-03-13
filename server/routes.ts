import type { Express } from "express";
import { createServer, type Server } from "http";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

interface VisitRecord {
  date: string;
  count: number;
}

const visitHistory: VisitRecord[] = [];
let totalVisits = 0;

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  read: boolean;
}
const contactMessages: ContactMessage[] = [];

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function recordVisit() {
  totalVisits++;
  const today = getTodayStr();
  const existing = visitHistory.find(v => v.date === today);
  if (existing) {
    existing.count++;
  } else {
    visitHistory.push({ date: today, count: 1 });
    if (visitHistory.length > 30) visitHistory.shift();
  }
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  TSX: "#61dafb",
  JavaScript: "#f7df1e",
  CSS: "#2965f1",
  JSON: "#cbcb41",
  HTML: "#e34c26",
  Python: "#3572a5",
  Other: "#888"
};

function analyzeLangStats() {
  const clientSrc = path.join(process.cwd(), "client/src");
  const stats: Record<string, number> = {};
  let totalLines = 0;

  function walkDir(dir: string) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(full);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          const langMap: Record<string, string> = {
            ".ts": "TypeScript",
            ".tsx": "TSX",
            ".js": "JavaScript",
            ".jsx": "JavaScript",
            ".css": "CSS",
            ".json": "JSON",
            ".html": "HTML"
          };
          const lang = langMap[ext] || "Other";
          try {
            const content = fs.readFileSync(full, "utf-8");
            const lines = content.split("\n").length;
            stats[lang] = (stats[lang] || 0) + lines;
            totalLines += lines;
          } catch {}
        }
      }
    } catch {}
  }

  walkDir(clientSrc);
  walkDir(path.join(process.cwd(), "server"));

  if (totalLines === 0) return [];

  return Object.entries(stats)
    .filter(([, lines]) => lines > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([language, lines]) => ({
      language,
      lines,
      percentage: Math.round((lines / totalLines) * 100),
      color: LANG_COLORS[language] || LANG_COLORS.Other
    }));
}

function sanitizeInput(str: string): string {
  return str.replace(/[<>]/g, "").trim().slice(0, 2000);
}

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" } }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.setTimeout(5000, () => { req.destroy(); reject(new Error("timeout")); });
  });
}

async function translateWithGoogle(text: string): Promise<string> {
  const encoded = encodeURIComponent(text);
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encoded}`;
  const raw = await fetchUrl(url);
  const parsed = JSON.parse(raw);
  if (parsed && parsed[0] && parsed[0][0] && parsed[0][0][0]) {
    return String(parsed[0][0][0]);
  }
  throw new Error("Google Translate failed");
}

async function translateWithMyMemory(text: string): Promise<string> {
  const encoded = encodeURIComponent(text);
  const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=id|en`;
  const raw = await fetchUrl(url);
  const parsed = JSON.parse(raw);
  if (parsed?.responseData?.translatedText) {
    return String(parsed.responseData.translatedText);
  }
  throw new Error("MyMemory failed");
}

async function translateIdToEn(text: string): Promise<string> {
  const engines = [translateWithGoogle, translateWithMyMemory];
  for (const engine of engines) {
    try {
      const result = await engine(text);
      if (result && result.trim()) return result.trim();
    } catch {}
  }
  throw new Error("All translation engines failed");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/analytics/visit", (req, res) => {
    recordVisit();
    res.json({ ok: true });
  });

  app.get("/api/analytics/stats", (req, res) => {
    const today = getTodayStr();
    const todayRecord = visitHistory.find(v => v.date === today);
    res.json({
      total: totalVisits,
      today: todayRecord?.count || 0,
      history: visitHistory
    });
  });

  app.get("/api/analytics/lang-stats", (req, res) => {
    try {
      const stats = analyzeLangStats();
      res.json(stats);
    } catch {
      res.json([]);
    }
  });

  app.post("/api/translate", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "text is required" });
      }
      const trimmed = text.trim().slice(0, 2000);
      if (!trimmed) return res.status(400).json({ error: "empty text" });
      const translated = await translateIdToEn(trimmed);
      res.json({ ok: true, result: translated });
    } catch (err: any) {
      res.status(500).json({ error: "Translation failed", message: err.message });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const body = req.body || {};
      const name = sanitizeInput(String(body.name || ""));
      const email = sanitizeInput(String(body.email || ""));
      const message = sanitizeInput(String(body.message || ""));

      if (!name || !email || !message) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      contactMessages.unshift({
        id: Date.now().toString(),
        name, email, message,
        timestamp: new Date().toISOString(),
        read: false
      });
      if (contactMessages.length > 100) contactMessages.splice(100);

      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;
      const emailRecipient = process.env.EMAIL_RECIPIENT || emailUser;

      if (!emailUser || !emailPass) {
        console.warn("[contact] EMAIL_USER/EMAIL_PASS not set — skipping send");
        return res.json({ ok: true, note: "email_not_configured" });
      }

      let transporter: ReturnType<typeof nodemailer.createTransport>;
      try {
        transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: emailUser, pass: emailPass },
          tls: { rejectUnauthorized: false }
        });
      } catch (transportErr) {
        console.error("[contact] Transport creation failed:", transportErr);
        return res.status(500).json({ error: "Email service unavailable" });
      }

      const recipient = emailRecipient;

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width">
</head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:'Plus Jakarta Sans',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f14;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a5f,#1a2744);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
            <h1 style="margin:0;font-size:18px;font-weight:700;color:#fff;">Pesan Baru Masuk</h1>
            <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.5);">Portfolio aka · ${new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </td>
        </tr>
        <tr>
          <td style="background:#141820;padding:28px 32px;border-left:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.06);">
            <div style="background:#1a1f2a;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 18px;margin-bottom:14px;">
              <p style="margin:0 0 3px;font-size:10px;font-weight:700;letter-spacing:0.08em;color:#3b82f6;text-transform:uppercase;">Pengirim</p>
              <p style="margin:0;font-size:15px;font-weight:600;color:#fff;">${name}</p>
            </div>
            <div style="background:#1a1f2a;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 18px;margin-bottom:14px;">
              <p style="margin:0 0 3px;font-size:10px;font-weight:700;letter-spacing:0.08em;color:#60a5fa;text-transform:uppercase;">Email</p>
              <p style="margin:0;font-size:14px;color:#93c5fd;">${email}</p>
            </div>
            <div style="background:#1a1f2a;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 18px;">
              <p style="margin:0 0 10px;font-size:10px;font-weight:700;letter-spacing:0.08em;color:#818cf8;text-transform:uppercase;">Pesan</p>
              <p style="margin:0;font-size:14px;line-height:1.7;color:rgba(255,255,255,0.8);white-space:pre-wrap;">${message}</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#0f1117;border-radius:0 0 16px 16px;border:1px solid rgba(255,255,255,0.06);border-top:none;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);">© 2026 Aka Portfolio — Pesan ini dikirim otomatis</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

      await transporter.sendMail({
        from: `"Portfolio aka" <${emailUser}>`,
        to: recipient,
        replyTo: email,
        subject: `📩 Pesan Baru dari ${name} — Portfolio aka`,
        html: htmlContent
      });

      res.json({ ok: true });
    } catch (err) {
      console.error("Email error:", err);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  app.get("/api/messages", (_req, res) => {
    res.json(contactMessages);
  });

  app.patch("/api/messages/:id/read", (req, res) => {
    const msg = contactMessages.find(m => m.id === req.params.id);
    if (msg) msg.read = true;
    res.json({ ok: true });
  });

  app.delete("/api/messages/:id", (req, res) => {
    const idx = contactMessages.findIndex(m => m.id === req.params.id);
    if (idx !== -1) contactMessages.splice(idx, 1);
    res.json({ ok: true });
  });

  return httpServer;
}

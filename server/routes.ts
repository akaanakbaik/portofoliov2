import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import os from "os";
import https from "https";
import http from "http";
import crypto from "crypto";

// ─── In-memory state ──────────────────────────────────────────────────────────
interface VisitRecord { date: string; count: number }
const visitHistory: VisitRecord[] = [];
let totalVisits = 0;

interface ContactMessage {
  id: string; name: string; email: string;
  message: string; timestamp: string; read: boolean;
}
const contactMessages: ContactMessage[] = [];

// Admin sessions: token → expiry timestamp (ms)
const adminSessions = new Map<string, number>();
// Rate limit: ip → { count, resetAt }
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
// Custom password set at runtime (overrides env var default)
let runtimeAdminPassword: string | null = null;

// ─── Admin password ───────────────────────────────────────────────────────────
function getAdminPassword(): string {
  return runtimeAdminPassword ?? process.env.ADMIN_PASSWORD ?? "akaa";
}

// ─── Session helpers ──────────────────────────────────────────────────────────
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function isValidSession(token: string): boolean {
  const exp = adminSessions.get(token);
  if (!exp) return false;
  if (Date.now() > exp) { adminSessions.delete(token); return false; }
  return true;
}

function purgeExpiredSessions() {
  const now = Date.now();
  for (const [t, exp] of adminSessions) {
    if (now > exp) adminSessions.delete(t);
  }
}

// ─── Admin middleware ─────────────────────────────────────────────────────────
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = (req.headers["x-admin-token"] as string) || "";
  if (!token || !isValidSession(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// ─── Rate limiter ─────────────────────────────────────────────────────────────
function checkLoginRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const limit = loginAttempts.get(ip) ?? { count: 0, resetAt: now + 15 * 60 * 1000 };
  if (now > limit.resetAt) { limit.count = 0; limit.resetAt = now + 15 * 60 * 1000; }
  loginAttempts.set(ip, limit);
  if (limit.count >= 5) return { allowed: false, remaining: 0 };
  limit.count++;
  return { allowed: true, remaining: 5 - limit.count };
}

// ─── Stats persistence ────────────────────────────────────────────────────────
const STATS_PATH = path.join(os.tmpdir(), "aka-portfolio-stats.json");

function loadPersistedStats() {
  try {
    const data = JSON.parse(fs.readFileSync(STATS_PATH, "utf-8"));
    if (typeof data.total === "number") totalVisits = data.total;
    if (Array.isArray(data.history)) {
      for (const item of data.history) {
        if (item && typeof item.date === "string" && typeof item.count === "number") {
          visitHistory.push(item);
        }
      }
    }
    console.log(`[stats] Loaded ${totalVisits} visits, ${visitHistory.length} days`);
  } catch { console.log("[stats] Starting fresh"); }
}

function savePersistedStats() {
  try { fs.writeFileSync(STATS_PATH, JSON.stringify({ total: totalVisits, history: visitHistory }), "utf-8"); }
  catch { /* ignore */ }
}

loadPersistedStats();

function getTodayStr() { return new Date().toISOString().slice(0, 10); }

function recordVisit() {
  totalVisits++;
  const today = getTodayStr();
  const existing = visitHistory.find(v => v.date === today);
  if (existing) { existing.count++; }
  else { visitHistory.push({ date: today, count: 1 }); if (visitHistory.length > 30) visitHistory.shift(); }
  savePersistedStats();
}

// ─── Language stats ───────────────────────────────────────────────────────────
const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", TSX: "#61dafb", JavaScript: "#f7df1e",
  CSS: "#2965f1", JSON: "#cbcb41", HTML: "#e34c26", Python: "#3572a5", Other: "#888"
};

function analyzeLangStats() {
  const stats: Record<string, number> = {};
  let totalLines = 0;
  function walkDir(dir: string) {
    try {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) { walkDir(full); continue; }
        const ext = path.extname(entry.name).toLowerCase();
        const lang = ({ ".ts": "TypeScript", ".tsx": "TSX", ".js": "JavaScript", ".jsx": "JavaScript", ".css": "CSS", ".json": "JSON", ".html": "HTML" })[ext] || "Other";
        try { const lines = fs.readFileSync(full, "utf-8").split("\n").length; stats[lang] = (stats[lang] || 0) + lines; totalLines += lines; } catch { }
      }
    } catch { }
  }
  const cwd = process.cwd();
  walkDir(path.join(cwd, "client/src"));
  walkDir(path.join(cwd, "server"));
  if (totalLines === 0) return [];
  return Object.entries(stats).filter(([, l]) => l > 0).sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([language, lines]) => ({ language, lines, percentage: Math.round((lines / totalLines) * 100), color: LANG_COLORS[language] || LANG_COLORS.Other }));
}

// ─── Sanitize ─────────────────────────────────────────────────────────────────
function sanitize(str: string): string {
  return str.replace(/[<>&"'`]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#x27;", "`": "&#x60;" })[c] || c).trim().slice(0, 2000);
}

// ─── Translate helpers ────────────────────────────────────────────────────────
function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, res => {
      let d = ""; res.on("data", c => d += c); res.on("end", () => resolve(d));
    });
    req.on("error", reject);
    req.setTimeout(5000, () => { req.destroy(); reject(new Error("timeout")); });
  });
}

async function translateIdToEn(text: string): Promise<string> {
  const engines = [
    async () => { const d = JSON.parse(await fetchUrl(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURIComponent(text)}`)); return d[0][0][0] as string; },
    async () => { const d = JSON.parse(await fetchUrl(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=id|en`)); return d.responseData.translatedText as string; }
  ];
  for (const fn of engines) {
    try { const r = await fn(); if (r?.trim()) return r.trim(); } catch { }
  }
  throw new Error("All translation engines failed");
}

// ─── Export ───────────────────────────────────────────────────────────────────
export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ── Security headers ────────────────────────────────────────────────────────
  app.use((_req, res, next) => {
    res.removeHeader("X-Powered-By");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
  });

  // ── Analytics ───────────────────────────────────────────────────────────────
  app.post("/api/analytics/visit", (req, res) => {
    recordVisit();
    res.json({ ok: true });
  });

  app.get("/api/analytics/stats", (req, res) => {
    const today = getTodayStr();
    res.json({ total: totalVisits, today: visitHistory.find(v => v.date === today)?.count || 0, history: visitHistory });
  });

  app.get("/api/analytics/lang-stats", (_req, res) => {
    try { res.json(analyzeLangStats()); } catch { res.json([]); }
  });

  // ── Admin auth ──────────────────────────────────────────────────────────────
  app.post("/api/admin/login", (req, res) => {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
    const { allowed } = checkLoginRateLimit(ip);
    if (!allowed) {
      return res.status(429).json({ error: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." });
    }
    const { password } = req.body || {};
    if (!password || typeof password !== "string") {
      return res.status(400).json({ error: "Password diperlukan" });
    }
    if (password.trim() !== getAdminPassword()) {
      return res.status(401).json({ error: "Password salah" });
    }
    // Valid login — generate session
    purgeExpiredSessions();
    const token = generateToken();
    adminSessions.set(token, Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    console.log(`[admin] Login from ${ip}`);
    res.json({ ok: true, token });
  });

  app.post("/api/admin/logout", (req, res) => {
    const token = req.headers["x-admin-token"] as string;
    if (token) adminSessions.delete(token);
    res.json({ ok: true });
  });

  app.get("/api/admin/check", (req, res) => {
    const token = req.headers["x-admin-token"] as string;
    if (!token || !isValidSession(token)) return res.status(401).json({ error: "Unauthorized" });
    res.json({ ok: true });
  });

  app.post("/api/admin/change-password", requireAdmin, (req, res) => {
    const { newPassword } = req.body || {};
    if (!newPassword || typeof newPassword !== "string" || newPassword.trim().length < 3) {
      return res.status(400).json({ error: "Password minimal 3 karakter" });
    }
    runtimeAdminPassword = newPassword.trim();
    // Invalidate all other sessions (force re-login with new password)
    adminSessions.clear();
    // Re-register the current session would require a new token, just clear all and user re-logs in
    console.log("[admin] Password changed at runtime");
    res.json({ ok: true, note: "Semua sesi lain telah dihapus. Login ulang dengan password baru." });
  });

  // ── Translate ───────────────────────────────────────────────────────────────
  app.post("/api/translate", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") return res.status(400).json({ error: "text required" });
      const trimmed = text.trim().slice(0, 2000);
      if (!trimmed) return res.status(400).json({ error: "empty text" });
      const translated = await translateIdToEn(trimmed);
      res.json({ ok: true, result: translated });
    } catch (err: any) {
      res.status(500).json({ error: "Translation failed", message: err.message });
    }
  });

  // ── Contact form ─────────────────────────────────────────────────────────────
  app.post("/api/contact", async (req, res) => {
    try {
      const body = req.body || {};
      const name = sanitize(String(body.name || ""));
      const email = sanitize(String(body.email || ""));
      const message = sanitize(String(body.message || ""));

      if (!name || !email || !message) {
        return res.status(400).json({ error: "Semua field wajib diisi" });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Format email tidak valid" });
      }
      if (message.length < 5) {
        return res.status(400).json({ error: "Pesan terlalu pendek" });
      }

      // Store message (always succeeds)
      contactMessages.unshift({
        id: Date.now().toString(), name, email, message,
        timestamp: new Date().toISOString(), read: false
      });
      if (contactMessages.length > 100) contactMessages.splice(100);

      // Return success immediately — email is fire-and-forget
      res.json({ ok: true });

      // Try to send email asynchronously (doesn't block response)
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;
      const emailRecipient = process.env.EMAIL_RECIPIENT || emailUser;
      if (!emailUser || !emailPass) { return; }

      setImmediate(async () => {
        try {
          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: { user: emailUser, pass: emailPass },
            connectionTimeout: 8000,
            socketTimeout: 8000,
            tls: { rejectUnauthorized: false }
          });
          const htmlContent = buildEmailHtml(name, email, message);
          await Promise.race([
            transporter.sendMail({ from: `"Portfolio aka" <${emailUser}>`, to: emailRecipient, replyTo: email, subject: `📩 Pesan dari ${name} — Portfolio aka`, html: htmlContent }),
            new Promise<void>((_, reject) => setTimeout(() => reject(new Error("timeout")), 9000))
          ]);
          console.log(`[contact] Email sent to ${emailRecipient}`);
        } catch (err) {
          console.error("[contact] Email error:", err instanceof Error ? err.message : err);
        }
      });
    } catch (err) {
      console.error("[contact] Error:", err);
      if (!res.headersSent) res.status(500).json({ error: "Server error" });
    }
  });

  // ── Messages (protected) ─────────────────────────────────────────────────────
  app.get("/api/messages", requireAdmin, (_req, res) => {
    res.json(contactMessages);
  });

  app.patch("/api/messages/:id/read", requireAdmin, (req, res) => {
    const msg = contactMessages.find(m => m.id === req.params.id);
    if (msg) msg.read = true;
    res.json({ ok: true });
  });

  app.delete("/api/messages/:id", requireAdmin, (req, res) => {
    const idx = contactMessages.findIndex(m => m.id === req.params.id);
    if (idx !== -1) contactMessages.splice(idx, 1);
    res.json({ ok: true });
  });

  return httpServer;
}

function buildEmailHtml(name: string, email: string, message: string): string {
  const date = new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:system-ui,sans-serif;">
  <table width="100%" style="background:#0f0f14;padding:32px 16px;"><tr><td align="center">
    <table width="560" style="max-width:560px;width:100%;">
      <tr><td style="background:linear-gradient(135deg,#1e3a5f,#1a2744);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
        <h1 style="margin:0;font-size:18px;font-weight:700;color:#fff;">📩 Pesan Baru</h1>
        <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.5);">Portfolio aka · ${date}</p>
      </td></tr>
      <tr><td style="background:#141820;padding:28px 32px;border:1px solid rgba(255,255,255,0.06);border-top:none;">
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
      </td></tr>
      <tr><td style="background:#0f1117;border-radius:0 0 16px 16px;border:1px solid rgba(255,255,255,0.06);border-top:none;padding:16px 32px;text-align:center;">
        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);">© 2026 Aka Portfolio — Pesan dikirim otomatis</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

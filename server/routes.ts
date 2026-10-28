import type { Express } from "express";
import type { Server } from "http";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import os from "os";
import https from "https";
import http from "http";
import crypto from "crypto";
import { translate as translateGoogle } from "@vitalets/google-translate-api";

import {
  db,
  configured,
  requireAdmin,
  passwordHash,
  passwordMatches,
  hash,
  adminToken,
  rateLimit,
  asyncRoute,
} from "./backend";
import { deliverMessage, emailConfigured } from "./mail";
import { settingsSchema } from "../shared/settings";
import { renderPage } from "./seo";

interface VisitRecord {
  date: string;
  count: number;
}
interface SupabaseVisitStats {
  total: number;
  today: number;
  history: VisitRecord[];
  generatedAt: string;
}
const readAnalyticsStats = () => db<SupabaseVisitStats>("analytics.stats");
const getSupabaseAnalyticsConfig = () => configured();
async function readCronDashboard() {
  const runs = await db<any[]>("cron.list");
  const now = new Date();
  const next = new Date(now);
  next.setUTCHours(3, 0, 0, 0);
  while (next <= now || ![1, 4].includes(next.getUTCDay()))
    next.setUTCDate(next.getUTCDate() + 1);
  return {
    jobName: "supabase-keepalive",
    schedule: "0 3 * * 1,4",
    timezone: "UTC",
    nextScheduledAt: next.toISOString(),
    lastSuccessAt:
      runs.find((r) => r.status === "success")?.completed_at || null,
    totalRuns: runs.length,
    successRuns: runs.filter((r) => r.status === "success").length,
    failedRuns: runs.filter((r) => r.status === "failed").length,
    latest: runs[0] || null,
    runs,
    generatedAt: now.toISOString(),
  };
}
// ─── Language stats ───────────────────────────────────────────────────────────
const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  TSX: "#61dafb",
  JavaScript: "#f7df1e",
  CSS: "#2965f1",
  JSON: "#cbcb41",
  HTML: "#e34c26",
  Python: "#3572a5",
  Other: "#888",
};

function analyzeLangStats() {
  const stats: Record<string, number> = {};
  let totalLines = 0;
  function walkDir(dir: string) {
    try {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(full);
          continue;
        }
        const ext = path.extname(entry.name).toLowerCase();
        const lang =
          {
            ".ts": "TypeScript",
            ".tsx": "TSX",
            ".js": "JavaScript",
            ".jsx": "JavaScript",
            ".css": "CSS",
            ".json": "JSON",
            ".html": "HTML",
          }[ext] || "Other";
        try {
          const lines = fs.readFileSync(full, "utf-8").split("\n").length;
          stats[lang] = (stats[lang] || 0) + lines;
          totalLines += lines;
        } catch {}
      }
    } catch {}
  }
  try {
    walkDir(path.join(process.cwd(), "client/src"));
    walkDir(path.join(process.cwd(), "server"));
  } catch {}
  if (totalLines === 0) return [];
  return Object.entries(stats)
    .filter(([, l]) => l > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([language, lines]) => ({
      language,
      lines,
      percentage: Math.round((lines / totalLines) * 100),
      color: LANG_COLORS[language] || LANG_COLORS.Other,
    }));
}

// ─── Translation ──────────────────────────────────────────────────────────────
function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(
      url,
      { headers: { "User-Agent": "Mozilla/5.0" } },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve(d));
      },
    );
    req.on("error", reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error("timeout"));
    });
  });
}

const translationCache = new Map<
  string,
  { value: string; expiresAt: number }
>();
const TRANSLATION_CACHE_TTL = 15 * 60 * 1000;

function cleanTranslation(value: unknown, source: string) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized || normalized.toLowerCase() === source.trim().toLowerCase())
    return null;
  return normalized.slice(0, 4000);
}

async function translateIdToEn(text: string): Promise<string> {
  const source = text.trim().slice(0, 2000);
  const cacheKey = source.toLowerCase();
  const cached = translationCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  const engines: Array<{ name: string; run: () => Promise<unknown> }> = [
    {
      name: "google-http",
      run: async () => {
        const d = JSON.parse(
          await fetchUrl(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURIComponent(source)}`,
          ),
        );
        return Array.isArray(d?.[0])
          ? d[0].map((part: unknown[]) => part?.[0] || "").join(" ")
          : null;
      },
    },
    {
      name: "google-translate-npm",
      run: async () =>
        (await translateGoogle(source, { from: "id", to: "en" })).text,
    },
    {
      name: "mymemory-http",
      run: async () => {
        const d = JSON.parse(
          await fetchUrl(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(source)}&langpair=id|en`,
          ),
        );
        return d?.responseData?.translatedText;
      },
    },
  ];
  const failures: string[] = [];
  for (const engine of engines) {
    try {
      const result = cleanTranslation(await engine.run(), source);
      if (result) {
        translationCache.set(cacheKey, {
          value: result,
          expiresAt: Date.now() + TRANSLATION_CACHE_TTL,
        });
        if (translationCache.size > 200)
          translationCache.delete(
            translationCache.keys().next().value as string,
          );
        return result;
      }
      failures.push(`${engine.name}: empty`);
    } catch (error: any) {
      failures.push(
        `${engine.name}: ${String(error?.message || "failed").slice(0, 120)}`,
      );
    }
  }
  throw new Error(`All translation engines failed: ${failures.join(" | ")}`);
}

// ─── Email HTML template ──────────────────────────────────────────────────────
let cronRunning = false;
async function executeSupabaseKeepAlive(triggerType: "scheduled" | "manual") {
  if (cronRunning) throw new Error("Cron already running");
  cronRunning = true;
  const start = new Date();
  try {
    const stats = await readAnalyticsStats();
    for (let i = 0; i < 5; i++) {
      const delivered = await deliverMessage();
      if (delivered.empty || delivered.configured === false) break;
    }
    const result = {
      ok: true,
      storage: "supabase",
      total: stats.total,
      today: stats.today,
    };
    await db("cron.record", {
      triggerType,
      status: "success",
      startedAt: start.toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - start.getTime(),
      response: result,
    });
    return result;
  } catch (error) {
    await db("cron.record", {
      triggerType,
      status: "failed",
      startedAt: start.toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - start.getTime(),
      errorMessage: "Keepalive failed",
    }).catch(() => {});
    throw error;
  } finally {
    cronRunning = false;
  }
}
// ─── Register routes ──────────────────────────────────────────────────────────
export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Security headers
  app.use((_req, res, next) => {
    res.removeHeader("X-Powered-By");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );
    next();
  });

  app.get(
    "/api/settings",
    asyncRoute(async (_req, res) => {
      res.setHeader("Cache-Control", "no-store");
      res.json(await db("settings.get"));
    }),
  );
  app.get(
    "/api/admin/settings/history",
    requireAdmin,
    asyncRoute(async (_req, res) => res.json(await db("settings.history"))),
  );
  app.put(
    "/api/admin/settings",
    requireAdmin,
    asyncRoute(async (req, res) => {
      const parsed = settingsSchema.safeParse(req.body.settings);
      if (!parsed.success || !Number.isInteger(req.body.version))
        return res
          .status(400)
          .json({
            error: "Pengaturan tidak valid. Periksa URL dan isi kolom.",
          });
      res.json(
        await db("settings.save", {
          settings: parsed.data,
          version: req.body.version,
        }),
      );
    }),
  );
  app.get(
    "/",
    asyncRoute(async (_req, res) => {
      res.type("html").setHeader("Cache-Control", "no-store");
      if(process.env.VERCEL_ENV==='preview')res.setHeader('X-Robots-Tag','noindex, follow');
      res.send(await renderPage());
    }),
  );
  app.post(
    "/api/analytics/visit",
    asyncRoute(async (req, res) => {
      if (!(await rateLimit(req, "visit", 30, 3600)))
        return res.status(429).json({ error: "Too many visits" });
      await db("analytics.visit");
      res.json({ ok: true, storage: "supabase" });
    }),
  );
  app.get("/api/analytics/stats", async (_req, res) => {
    try {
      return res.json(await readAnalyticsStats());
    } catch (error) {
      console.error("[analytics/stats] Storage error:", error);
      return res.status(502).json({ error: "Analytics storage unavailable" });
    }
  });

  app.get("/api/cron/supabase-keepalive", async (req, res) => {
    const cronSecret = (process.env.CRON_SECRET || "").trim();
    const authorization = req.headers.authorization || "";
    if (!cronSecret || authorization !== `Bearer ${cronSecret}`)
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    if (!getSupabaseAnalyticsConfig())
      return res
        .status(503)
        .json({ ok: false, error: "Supabase analytics is not configured" });
    try {
      return res.json(await executeSupabaseKeepAlive("scheduled"));
    } catch (error: any) {
      console.error("[cron/supabase-keepalive] Storage error:", error);
      return res
        .status(502)
        .json({ ok: false, error: "Supabase keep-alive failed" });
    }
  });

  app.get("/api/admin/cron/status", requireAdmin, async (_req, res) => {
    try {
      return res.json(await readCronDashboard());
    } catch (error: any) {
      console.error("[admin/cron/status] Storage error:", error);
      return res
        .status(502)
        .json({ ok: false, error: "Cron dashboard unavailable" });
    }
  });

  app.post("/api/admin/cron/run", requireAdmin, async (_req, res) => {
    if (!getSupabaseAnalyticsConfig())
      return res
        .status(503)
        .json({ ok: false, error: "Supabase analytics is not configured" });
    try {
      return res.json(await executeSupabaseKeepAlive("manual"));
    } catch (error: any) {
      console.error("[admin/cron/run] Storage error:", error);
      return res
        .status(502)
        .json({ ok: false, error: "Supabase keep-alive failed" });
    }
  });

  app.get("/api/analytics/lang-stats", (_req, res) => {
    try {
      res.json(analyzeLangStats());
    } catch {
      res.json([]);
    }
  });

  app.post(
    "/api/admin/login",
    asyncRoute(async (req, res) => {
      if (!(await rateLimit(req, "login", 5, 900)))
        return res
          .status(429)
          .json({
            error: "Terlalu banyak percobaan. Coba lagi dalam 15 menit.",
          });
      const password = req.body?.password;
      if (
        typeof password !== "string" ||
        password.length > 256 ||
        !password.trim()
      )
        return res.status(400).json({ error: "Password diperlukan" });
      let auth = await db("auth.get");
      if (!auth.hash) {
        if (!process.env.ADMIN_PASSWORD)
          return res.status(503).json({ error: "Admin belum dikonfigurasi" });
        await db("auth.seed", {
          hash: await passwordHash(process.env.ADMIN_PASSWORD.trim()),
        });
        auth = await db("auth.get");
      }
      if (!(await passwordMatches(password.trim(), auth.hash)))
        return res.status(401).json({ error: "Password salah" });
      const token = crypto.randomBytes(32).toString("hex");
      await db("session.create", { hash: hash(token) });
      res.json({ ok: true, token });
    }),
  );
  app.post(
    "/api/admin/logout",
    requireAdmin,
    asyncRoute(async (req, res) => {
      await db("session.revoke", { hash: hash(adminToken(req)) });
      res.json({ ok: true });
    }),
  );
  app.get("/api/admin/check", requireAdmin, (_req, res) =>
    res.json({ ok: true }),
  );
  app.get(
    "/api/admin/health",
    requireAdmin,
    asyncRoute(async (_req, res) => {
      const stats = await readAnalyticsStats();
      res.json({
        ok: true,
        generatedAt: new Date().toISOString(),
        uptimeSeconds: Math.round(process.uptime()),
        adminPasswordConfigured: true,
        emailConfigured: emailConfigured(),
        statsStorage: "supabase-postgres",
        messagesStorage: "supabase-postgres",
        settingsStorage: "supabase-postgres",
        lastVisitDate: stats.history.at(-1)?.date || null,
      });
    }),
  );
  app.post(
    "/api/admin/change-password",
    requireAdmin,
    asyncRoute(async (req, res) => {
      const password = req.body?.newPassword;
      if (
        typeof password !== "string" ||
        password.trim().length < 12 ||
        password.length > 256
      )
        return res
          .status(400)
          .json({ error: "Password harus 12–256 karakter" });
      await db("auth.password", { hash: await passwordHash(password.trim()) });
      res.json({ ok: true, requiresLogin: true });
    }),
  );
  app.post(
    "/api/admin/email/verify",
    requireAdmin,
    asyncRoute(async (_req, res) => {
      if (!emailConfigured())
        return res
          .status(503)
          .json({ ok: false, error: "Email belum dikonfigurasi" });
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
        await transport.verify();
        res.json({ ok: true });
      } finally {
        transport.close();
      }
    }),
  );
  // ── Test email (admin only) ──────────────────────────────────────────────────
  app.post("/api/admin/test-email", requireAdmin, async (req, res) => {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailTo = process.env.EMAIL_RECIPIENT || emailUser;
    if (!emailUser || !emailPass) {
      return res.json({
        ok: false,
        error: "EMAIL_USER / EMAIL_PASS belum diset di environment variables",
      });
    }
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: emailUser, pass: emailPass },
        connectionTimeout: 8000,
        socketTimeout: 8000,
        tls: { rejectUnauthorized: true },
      });
      await Promise.race([
        transporter.sendMail({
          from: `"Portfolio aka" <${emailUser}>`,
          to: emailTo,
          subject: "✅ Test Email — Admin Dashboard Portfolio aka",
          html: `<div style="font-family:system-ui;padding:24px;background:#0f0f14;color:#fff;border-radius:12px;max-width:400px">
            <h2 style="margin:0 0 8px;color:#3b82f6">✅ Email Berhasil!</h2>
            <p style="margin:0;color:rgba(255,255,255,0.7)">Konfigurasi email Anda berjalan dengan baik.</p>
            <p style="margin:12px 0 0;font-size:12px;color:rgba(255,255,255,0.4)">Dikirim dari Admin Dashboard · ${new Date().toLocaleString("id-ID")}</p>
          </div>`,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 9000),
        ),
      ]);
      console.log(`[admin] Test email sent to ${emailTo}`);
      res.json({ ok: true, to: emailTo });
    } catch (err: any) {
      const msg = err?.message || "Unknown error";
      console.error("[admin] Test email failed:", msg);
      res.json({ ok: false, error: msg });
    }
  });

  // ── Translate ───────────────────────────────────────────────────────────────
  app.post("/api/translate", requireAdmin, async (req, res) => {
    try {
      const { text } = req.body || {};
      if (!text || typeof text !== "string")
        return res.status(400).json({ error: "text required" });
      const trimmed = text.trim().slice(0, 2000);
      if (!trimmed) return res.status(400).json({ error: "empty text" });
      const translated = await translateIdToEn(trimmed);
      res.json({ ok: true, result: translated });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Translation failed", message: err?.message });
    }
  });

  app.post(
    "/api/contact",
    asyncRoute(async (req, res) => {
      const body = req.body || {};
      if (body.website) return res.json({ ok: true });
      if (!(await rateLimit(req, "contact", 5, 3600)))
        return res
          .status(429)
          .json({ error: "Terlalu banyak pesan. Coba lagi nanti." });
      const { name, email, message } = body;
      if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof message !== "string" ||
        !name.trim() ||
        name.trim().length > 100 ||
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        /[\r\n]/.test(name + email) ||
        message.trim().length < 5 ||
        message.trim().length > 1000
      )
        return res
          .status(400)
          .json({ error: "Nama, email, atau pesan tidak valid." });
      const stored = await db("contact.insert", {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });
      const delivery = await deliverMessage(stored.id).catch(()=>({sent:false}));
      res
        .status(201)
        .json({
          ok: true,
          id: stored.id,
          emailStatus: delivery.sent ? "sent" : "pending",
        });
    }),
  );
  app.get(
    "/api/messages",
    requireAdmin,
    asyncRoute(async (_req, res) => res.json(await db("contact.list"))),
  );
  app.patch(
    "/api/messages/:id/read",
    requireAdmin,
    asyncRoute(async (req, res) =>
      res.json(await db("contact.read", { id: req.params.id })),
    ),
  );
  app.delete(
    "/api/messages/:id",
    requireAdmin,
    asyncRoute(async (req, res) =>
      res.json(await db("contact.delete", { id: req.params.id })),
    ),
  );
  return httpServer;
}

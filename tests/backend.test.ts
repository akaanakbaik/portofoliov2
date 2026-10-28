import { before, after, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { registerRoutes } from "../server/routes";
import { defaultSettings } from "../client/src/lib/PortfolioContext";
import { passwordHash, passwordMatches } from "../server/backend";
import { settingsSchema } from "../shared/settings";
let state: any, server: any, base: string;
const originalFetch = globalThis.fetch;
process.env.SUPABASE_URL = "https://test.supabase.co";
process.env.SUPABASE_PUBLISHABLE_KEY = "test";
process.env.PORTFOLIO_BACKEND_TOKEN = "a".repeat(64);
process.env.ADMIN_PASSWORD = "Fixture-only-password-2026";
process.env.CRON_SECRET = "fixture-cron-secret";
before(() => {
  globalThis.fetch = async (input: any, init: any) => {
    if (!String(input).startsWith("https://test.supabase.co"))
      return originalFetch(input, init);
    const { p_action: action, p_data: d } = JSON.parse(init.body);
    let result: any = { ok: true },
      status = 200;
    switch (action) {
      case "settings.get":
        result = { settings: state.settings, version: state.version };
        break;
      case "settings.save":
        if (d.version !== state.version) {
          result = { code: "40001" };
          status = 409;
        } else {
          state.settings = d.settings;
          result = { version: ++state.version };
        }
        break;
      case "auth.get":
        result = { hash: state.password };
        break;
      case "auth.seed":
        if (!state.password) state.password = d.hash;
        break;
      case "auth.password":
        state.password = d.hash;
        state.sessions.clear();
        break;
      case "session.create":
        state.sessions.add(d.hash);
        break;
      case "session.check":
        result = { valid: state.sessions.has(d.hash) };
        break;
      case "session.revoke":
        state.sessions.delete(d.hash);
        break;
      case "rate.limit":
        state.rates[d.bucket] = (state.rates[d.bucket] || 0) + 1;
        result = { allowed: state.rates[d.bucket] <= d.limit };
        break;
      case "contact.insert":
        result = { id: "00000000-0000-4000-8000-000000000001" };
        state.messages.push({ ...d, id: result.id, read: false });
        break;
      case "contact.list":
        result = state.messages;
        break;
      case "contact.read":
        state.messages.find((m: any) => m.id === d.id).read = true;
        break;
      case "contact.delete":
        state.messages = state.messages.filter((m: any) => m.id !== d.id);
        break;
      case "analytics.stats":
        result = {
          total: 12,
          today: 2,
          history: [],
          generatedAt: new Date().toISOString(),
        };
        break;
      case "cron.list":
        result = state.cron;
        break;
      case "cron.record":
        state.cron.push(d);
        break;
    }
    return new Response(JSON.stringify(result), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  };
  const app = express();
  app.use(express.json({ limit: "64kb" }));
  registerRoutes(null as any, app);
  app.use((error: any, _req: any, res: any, _next: any) =>
    res.status(error.status || 500).json({ error: error.message }),
  );
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});
beforeEach(() => {
  state = {
    settings: null,
    version: 0,
    password: null,
    sessions: new Set(),
    rates: {},
    messages: [],
    cron: [],
  };
});
after(() => {
  globalThis.fetch = originalFetch;
  server.close();
});
async function request(
  path: string,
  method = "GET",
  body?: unknown,
  token?: string,
) {
  return fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-Admin-Token": token } : {}),
    },
    body:
      body === undefined || method === "GET" ? undefined : JSON.stringify(body),
  });
}
async function login() {
  const r = await request("/api/admin/login", "POST", {
    password: process.env.ADMIN_PASSWORD,
  });
  assert.equal(r.status, 200);
  return (await r.json()).token;
}
test("scrypt verifies valid passwords and rejects invalid/malformed values", async () => {
  const h = await passwordHash("a password");
  assert.equal(await passwordMatches("a password", h), true);
  assert.equal(await passwordMatches("wrong", h), false);
  assert.equal(await passwordMatches("a", "bad"), false);
});
test("all internal endpoints require authentication", async () => {
  for (const [path, method] of [
    ["/api/messages", "GET"],
    ["/api/admin/health", "GET"],
    ["/api/admin/settings", "PUT"],
    ["/api/admin/cron/status", "GET"],
    ["/api/translate", "POST"],
  ])
    assert.equal((await request(path, method, {})).status, 401);
});
test("login, cross-request session validation and logout revocation", async () => {
  const token = await login();
  assert.equal(
    (await request("/api/admin/check", "GET", undefined, token)).status,
    200,
  );
  await request("/api/admin/logout", "POST", {}, token);
  assert.equal(
    (await request("/api/admin/check", "GET", undefined, token)).status,
    401,
  );
});
test("failed logins are rate limited", async () => {
  for (let i = 0; i < 5; i++)
    assert.equal(
      (await request("/api/admin/login", "POST", { password: "wrong" })).status,
      401,
    );
  assert.equal(
    (await request("/api/admin/login", "POST", { password: "wrong" })).status,
    429,
  );
});
test("settings publish globally and stale writes fail without overwriting", async () => {
  const token = await login();
  const settings = { ...defaultSettings, name: "Published Aka" };
  assert.equal(
    (
      await request(
        "/api/admin/settings",
        "PUT",
        { settings, version: 0 },
        token,
      )
    ).status,
    200,
  );
  assert.equal(
    (await (await request("/api/settings")).json()).settings.name,
    "Published Aka",
  );
  assert.equal(
    (
      await request(
        "/api/admin/settings",
        "PUT",
        { settings: defaultSettings, version: 0 },
        token,
      )
    ).status,
    409,
  );
});
test("settings reject unsafe URLs, malformed fields and canonical hijacks", async () => {
  assert.equal(settingsSchema.safeParse(defaultSettings).success, true);
  for (const settings of [
    { ...defaultSettings, photoUrl: "javascript:alert(1)" },
    {
      ...defaultSettings,
      seo: { ...defaultSettings.seo, canonical: "https://evil.example/" },
    },
    { ...defaultSettings, name: "" },
  ])
    assert.equal(settingsSchema.safeParse(settings).success, false);
});
test("password change is durable and revokes every existing session", async () => {
  const first = await login(),
    second = await login();
  assert.equal(
    (
      await request(
        "/api/admin/change-password",
        "POST",
        { newPassword: "A-new-fixture-password-2026" },
        first,
      )
    ).status,
    200,
  );
  for (const token of [first, second])
    assert.equal(
      (await request("/api/admin/check", "GET", undefined, token)).status,
      401,
    );
  assert.equal(
    (
      await request("/api/admin/login", "POST", {
        password: process.env.ADMIN_PASSWORD,
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await request("/api/admin/login", "POST", {
        password: "A-new-fixture-password-2026",
      })
    ).status,
    200,
  );
});
test("contact validation, honeypot, persistence, read and deletion", async () => {
  assert.equal(
    (
      await request("/api/contact", "POST", {
        name: "",
        email: "bad",
        message: "x",
      })
    ).status,
    400,
  );
  await request("/api/contact", "POST", { website: "spam" });
  assert.equal(state.messages.length, 0);
  const r = await request("/api/contact", "POST", {
    name: "Aka QA",
    email: "qa@example.com",
    message: "Valid fixture message",
  });
  assert.equal(r.status, 201);
  const { id } = await r.json();
  const token = await login();
  assert.equal(
    (await (await request("/api/messages", "GET", undefined, token)).json())
      .length,
    1,
  );
  await request(`/api/messages/${id}/read`, "PATCH", {}, token);
  assert.equal(state.messages[0].read, true);
  await request(`/api/messages/${id}`, "DELETE", {}, token);
  assert.equal(state.messages.length, 0);
});
test("oversized contact messages are rejected server-side", async () => {
  assert.equal(
    (
      await request("/api/contact", "POST", {
        name: "QA",
        email: "qa@example.com",
        message: "x".repeat(1001),
      })
    ).status,
    400,
  );
});
test("cron blocks unauthenticated traffic and dashboard uses twice-weekly schedule", async () => {
  assert.equal((await request("/api/cron/supabase-keepalive")).status, 401);
  const token = await login();
  const r = await request("/api/admin/cron/run", "POST", {}, token);
  assert.equal(r.status, 200);
  assert.equal(state.cron[0].status, "success");
  const d = await (
    await request("/api/admin/cron/status", "GET", undefined, token)
  ).json();
  assert.equal(d.schedule, "0 3 * * 1,4");
  assert.ok([1, 4].includes(new Date(d.nextScheduledAt).getUTCDay()));
});
test("server HTML includes visible identity, projects, canonical and valid schema", async () => {
  const r = await request("/");
  const html = await r.text();
  assert.equal(r.status, 200, html);
  for (const text of [
    "Abdul Khaliq Arrasyid",
    "bg aka",
    "SMAN 1 Lembah Melintang",
    "PMR",
    "Proyek Saya",
    "https://akaa.dev/",
  ])
    assert.ok(html.includes(text), text);
  const schema = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  );
  assert.ok(schema);
  assert.equal(
    JSON.parse(schema[1])["@graph"][0].name,
    "Abdul Khaliq Arrasyid",
  );
  assert.ok(!html.includes("p_token"));
});

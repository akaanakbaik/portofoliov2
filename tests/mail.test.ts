import { test, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import nodemailer from "nodemailer";
import { deliverMessage } from "../server/mail";
const originalFetch = globalThis.fetch,
  originalTransport = nodemailer.createTransport;
let calls: any[],
  mail: any,
  fail: boolean,
  empty: boolean,
  transportOptions: any;
process.env.SUPABASE_URL = "https://test.supabase.co";
process.env.SUPABASE_PUBLISHABLE_KEY = "test";
process.env.PORTFOLIO_BACKEND_TOKEN = "a".repeat(64);
beforeEach(() => {
  calls = [];
  fail = false;
  empty = false;
  mail = undefined;
  delete process.env.EMAIL_USER;
  delete process.env.EMAIL_PASS;
  globalThis.fetch = async (_url: any, init: any) => {
    const data = JSON.parse(init.body);
    calls.push(data);
    return new Response(
      JSON.stringify(
        data.p_action === "contact.claim" && !empty
          ? {
              id: "fixture-id",
              name: "<QA>",
              email: "qa@example.com",
              message: "<script>fixture</script>",
            }
          : { ok: true },
      ),
      { status: 200 },
    );
  };
  nodemailer.createTransport = ((options: any) => {
    transportOptions = options;
    return {
      sendMail: async (message: any) => {
        mail = message;
        if (fail) throw new Error("SMTP fixture failure");
      },
      close: () => {},
    };
  }) as any;
});
after(() => {
  globalThis.fetch = originalFetch;
  nodemailer.createTransport = originalTransport;
});
test("unconfigured email leaves the durable message queued without claiming it", async () => {
  assert.deepEqual(await deliverMessage(), { configured: false });
  assert.equal(calls.length, 0);
});
test("delivery waits for SMTP and records success with TLS validation enabled", async () => {
  process.env.EMAIL_USER = "owner@example.com";
  process.env.EMAIL_PASS = "fixture";
  assert.deepEqual(await deliverMessage("fixture-id"), { sent: true });
  assert.equal(transportOptions.tls.rejectUnauthorized, true);
  assert.equal(calls.at(-1).p_data.ok, true);
  assert.ok(mail.html.includes("&lt;script&gt;"));
  assert.ok(!mail.html.includes("<script>"));
  assert.equal(mail.messageId, "<fixture-id@akaa.dev>");
});
test("SMTP failure records retryable failure instead of losing the message", async () => {
  process.env.EMAIL_USER = "owner@example.com";
  process.env.EMAIL_PASS = "fixture";
  fail = true;
  assert.deepEqual(await deliverMessage("fixture-id"), { sent: false });
  assert.equal(calls.at(-1).p_action, "contact.delivered");
  assert.equal(calls.at(-1).p_data.ok, false);
});
test("an empty queue sends no email", async () => {
  process.env.EMAIL_USER = "owner@example.com";
  process.env.EMAIL_PASS = "fixture";
  empty = true;
  assert.deepEqual(await deliverMessage(), { empty: true });
  assert.equal(mail, undefined);
});

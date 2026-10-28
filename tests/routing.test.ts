import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import handler from "../api/index";
let server: http.Server, base: string;
before(() => {
  server = http
    .createServer(
      (typeof handler === "function"
        ? handler
        : (handler as any).default) as any,
    )
    .listen(0);
  base = `http://127.0.0.1:${(server.address() as any).port}`;
});
after(() => server.close());
test("admin and private preview are served with noindex headers and markup", async () => {
  for (const path of ["/x7k9adm2p4q", "/preview"]) {
    const r = await fetch(base + path, { signal: AbortSignal.timeout(5000) });
    assert.equal(r.status, 200);
    assert.equal(r.headers.get("x-robots-tag"), "noindex, nofollow");
    assert.match(await r.text(), /content="noindex, nofollow/);
  }
});
test("unknown page returns real HTTP 404", async () => {
  const r = await fetch(base + "/missing-page");
  assert.equal(r.status, 404);
  assert.equal(r.headers.get("x-robots-tag"), "noindex, nofollow");
});
test("unknown API returns JSON HTTP 404", async () => {
  const r = await fetch(base + "/api/missing");
  assert.equal(r.status, 404);
  assert.match(r.headers.get("content-type") || "", /json/);
});

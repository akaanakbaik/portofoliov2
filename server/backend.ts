import crypto from "node:crypto";
import { promisify } from "node:util";
import type { Request, Response, NextFunction } from "express";
const scrypt = promisify(crypto.scrypt);
export const hash = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");
export function configured() {
  return Boolean(
    process.env.SUPABASE_URL &&
      process.env.SUPABASE_PUBLISHABLE_KEY &&
      process.env.PORTFOLIO_BACKEND_TOKEN,
  );
}
export async function db<T = any>(
  action: string,
  data: Record<string, unknown> = {},
): Promise<T> {
  if (!configured()) throw new Error("Database is not configured");
  const response = await fetch(
    `${process.env.SUPABASE_URL!.replace(/\/$/, "")}/rest/v1/rpc/portfolio_gateway`,
    {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_PUBLISHABLE_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_token: process.env.PORTFOLIO_BACKEND_TOKEN,
        p_action: action,
        p_data: data,
      }),
      signal: AbortSignal.timeout(10000),
    },
  ).catch(() => { throw Object.assign(new Error("Database temporarily unavailable"), {status:503}); });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const e = new Error(
      ["40001", "23505"].includes(error.code)
        ? "Settings changed; reload before saving"
        : "Database operation failed",
    ) as Error & { status?: number };
    e.status = ["40001", "23505"].includes(error.code) ? 409 : 503;
    throw e;
  }
  return response.json();
}
export async function passwordHash(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${key.toString("hex")}`;
}
export async function passwordMatches(password: string, encoded: string) {
  const [method, salt, value] = encoded.split(":");
  if (method !== "scrypt" || !salt || !value) return false;
  const key = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(value, "hex");
  return (
    key.length === expected.length && crypto.timingSafeEqual(key, expected)
  );
}
export function adminToken(req: Request) {
  return typeof req.headers["x-admin-token"] === "string"
    ? req.headers["x-admin-token"]
    : "";
}
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = adminToken(req);
    if (
      token.length < 40 ||
      !(await db("session.check", { hash: hash(token) })).valid
    ) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    next();
  } catch {
    res.status(503).json({ error: "Authentication temporarily unavailable" });
  }
}
export async function rateLimit(
  req: Request,
  scope: string,
  limit: number,
  seconds: number,
) {
  const ip = process.env.VERCEL
    ? req.headers["x-vercel-forwarded-for"] ||
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress
    : req.socket.remoteAddress;
  const key = hash(
    `${process.env.PORTFOLIO_BACKEND_TOKEN}:${scope}:${String(ip).split(",")[0].trim()}`,
  );
  return (await db("rate.limit", { bucket: key, limit, seconds })).allowed;
}
export const asyncRoute =
  (handler: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res)).catch(next);
  };

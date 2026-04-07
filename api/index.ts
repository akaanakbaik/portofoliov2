import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "../server/routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[api] Unhandled error:", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  if (!res.headersSent) res.status(status).json({ message });
});

// Initialize routes once (synchronous — registerRoutes only calls app.use/app.get/app.post)
let initialized = false;
function ensureInit() {
  if (initialized) return;
  initialized = true;
  // registerRoutes is async but only does synchronous route registration
  // We call it synchronously by ignoring the returned promise value
  // All route handlers are registered immediately (no awaits in the registration code itself)
  registerRoutes(null as any, app).catch((e) => {
    console.error("[api] Failed to register routes:", e);
  });
}

ensureInit();

export default app;

import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "../server/routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register routes (all route registrations are synchronous inside this async fn)
let routesReady = false;
const routeSetup = (async () => {
  try {
    await registerRoutes(null as any, app);
    routesReady = true;
    console.log("[api] Routes registered");
  } catch (err) {
    console.error("[api] Failed to register routes:", err);
  }
})();

// 4-arg error handler (must be registered after routes)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[api] Express error:", err);
  const status = err.status || err.statusCode || 500;
  if (!res.headersSent) res.status(status).json({ error: err.message || "Internal Server Error" });
});

export default async function handler(req: Request, res: Response) {
  try {
    await routeSetup;
    app(req, res, (err: any) => {
      if (err) {
        console.error("[api] Unhandled route error:", err);
        if (!res.headersSent) res.status(500).json({ error: String(err?.message || err) });
      }
    });
  } catch (err: any) {
    console.error("[api] Handler crash:", err);
    if (!res.headersSent) res.status(500).json({ error: String(err?.message || "Handler failed") });
  }
}

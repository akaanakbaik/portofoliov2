import { shell } from "../server/generated-shell";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { registerRoutes } from "../server/routes";

const app = express();

app.use(express.json({ limit: "64kb" }));
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

app.use("/api", (_req: Request, res: Response) => {
  if (!res.headersSent) res.status(404).json({ error: "API route not found" });
});

app.use((req, res) => {
  const admin = ["/x7k9adm2p4q", "/preview"].includes(req.path);
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("Cache-Control", "no-store");
  res
    .status(admin ? 200 : 404)
    .type("html")
    .send(
      shell.replace(/content="index, follow/g, 'content="noindex, nofollow'),
    );
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[api] Express error:", err);
  const status = err.status || err.statusCode || 500;
  if (!res.headersSent)
    res
      .status(status)
      .json({
        error:
          status < 500
            ? err.message
            : "Layanan sementara tidak tersedia. Coba lagi.",
      });
});

export default async function handler(req: Request, res: Response) {
  try {
    await routeSetup;
    app(req, res, (err: any) => {
      if (err) {
        console.error("[api] Unhandled route error:", err);
        if (!res.headersSent)
          res.status(500).json({ error: String(err?.message || err) });
      }
    });
  } catch (err: any) {
    console.error("[api] Handler crash:", err);
    if (!res.headersSent)
      res.status(500).json({ error: String(err?.message || "Handler failed") });
  }
}

import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "../server/routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const httpServer = createServer(app);

let initDone = false;
let initErr: Error | null = null;

const initPromise = (async () => {
  try {
    await registerRoutes(httpServer, app);
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Express error:", err);
      if (!res.headersSent) res.status(status).json({ message });
    });
    initDone = true;
  } catch (e) {
    initErr = e as Error;
    console.error("Failed to init routes:", e);
  }
})();

export default async function handler(req: Request, res: Response) {
  try {
    await initPromise;
    if (initErr) {
      return res.status(500).json({ error: "Server initialization failed", message: initErr.message });
    }
    app(req, res, (err: any) => {
      if (err) {
        console.error("Unhandled route error:", err);
        if (!res.headersSent) res.status(500).json({ error: "Internal Server Error" });
      }
    });
  } catch (e: any) {
    console.error("Handler error:", e);
    if (!res.headersSent) res.status(500).json({ error: e.message || "Internal Server Error" });
  }
}

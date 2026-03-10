import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "../server/routes";

const app = express();

app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJson: Record<string, any> | undefined;

  const origJson = res.json;
  res.json = function (body: any, ...args: any[]) {
    capturedJson = body;
    return origJson.apply(res, [body, ...args] as any);
  };

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      const duration = Date.now() - start;
      let log = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJson) log += ` :: ${JSON.stringify(capturedJson)}`;
      console.log(log);
    }
  });

  next();
});

const httpServer = createServer(app);
let initialized = false;

async function init() {
  if (!initialized) {
    await registerRoutes(httpServer, app);
    app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      if (res.headersSent) return next(err);
      return res.status(status).json({ message });
    });
    initialized = true;
  }
}

const initPromise = init();

export default async function handler(req: Request, res: Response) {
  await initPromise;
  return app(req, res);
}

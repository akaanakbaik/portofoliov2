import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // Preserve real 404 status while letting the client render its matching page.
  app.use("/{*path}", (req, res) => {
    const known=["/x7k9adm2p4q","/preview"].includes(req.path);
    res.status(known?200:404);
    res.setHeader("X-Robots-Tag","noindex, nofollow");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

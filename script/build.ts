import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile } from "fs/promises";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  // Build the Vercel API function as a pre-compiled CJS bundle.
  // This bypasses Vercel's TypeScript compiler (which has issues with
  // our tsconfig's noEmit:true / moduleResolution:bundler / module:ESNext settings).
  // esbuild bundles everything into a single CJS file that Vercel runs directly.
  console.log("building api function for Vercel...");
  await esbuild({
    entryPoints: ["api/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "api/server.js",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: false,
    // Bundle all deps (express, nodemailer, etc.) so the function is self-contained
    external: ["fsevents"],
    logLevel: "info",
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});

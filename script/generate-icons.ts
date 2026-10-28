import { readFile, mkdir, writeFile } from "node:fs/promises";
import vm from "node:vm";
const source = await readFile(
  "node_modules/tech-stack-icons/dist/index.js",
  "utf8",
);
const context: {
  icons?: Record<string, { svg: { light: string; dark: string } }>;
} = {};
vm.runInNewContext(
  source
    .trim()
    .replace(/^import[^;]+;/, 'const v={};const r=()=>"";')
    .replace(/export\{b as default\};?$/, "globalThis.icons=h;"),
  context,
  { timeout: 5000 },
);
if (!context.icons) throw new Error("Icon library format changed");
await mkdir("client/public/assets/stack", { recursive: true });
for (const [name, icon] of Object.entries(context.icons)) {
  if (!/^[a-z0-9-]+$/i.test(name)) continue;
  for (const variant of ["dark", "light"] as const)
    if (icon.svg[variant])
      await writeFile(
        `client/public/assets/stack/${name}-${variant}.svg`,
        icon.svg[variant],
      );
}
console.log(
  "Generated individual technology SVGs; icon catalog excluded from public JS.",
);

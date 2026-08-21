import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import StackIcon from "tech-stack-icons";
import { useLang } from "@/lib/LangContext";
import { usePortfolio } from "@/lib/PortfolioContext";
import { PORTFOLIO_CONFIG } from "@/lib/config";

const DISPLAY_NAMES: Record<string, string> = {
  js: "JavaScript", go: "Go", bunjs: "Bun", bootstrap5: "Bootstrap",
  vitejs: "Vite", html5: "HTML5", css3: "CSS3", typescript: "TypeScript",
  python: "Python", php: "PHP", react: "React", tailwindcss: "Tailwind CSS",
  nextjs: "Next.js", threejs: "Three.js", nodejs: "Node.js", expressjs: "Express",
  vscode: "VS Code", github: "GitHub", supabase: "Supabase", appwrite: "Appwrite",
  postgresql: "PostgreSQL", mysql: "MySQL", anthropic: "Anthropic", groq: "Groq",
  deepseek: "DeepSeek", nvidia: "NVIDIA", bash: "Bash", npm: "npm", chrome: "Chrome",
  docker: "Docker", flutter: "Flutter", gemini: "Gemini", google: "Google",
  ubuntu: "Ubuntu", linux: "Linux", mongodb: "MongoDB", openai: "OpenAI",
  vercel: "Vercel", n8n: "n8n", pterodactyl: "Pterodactyl", antigravity: "Antigravity",
  edge: "Microsoft Edge", kimi: "Kimi AI", neon: "Neon DB", v0: "v0.dev",
  grok: "Grok AI"
};

function TechItem({ name, isPterodactyl }: { name: string; isPterodactyl?: boolean }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const displayName = DISPLAY_NAMES[name] || (name.charAt(0).toUpperCase() + name.slice(1));

  const showTooltip = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - 10;
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setTooltip({ x, y });
    hideTimer.current = setTimeout(() => setTooltip(null), 2600);
  }, []);

  const hideTooltip = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setTooltip(null);
  }, []);

  return (
    <>
      <motion.button
        type="button"
        whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.08 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
        onClick={showTooltip}
        onMouseLeave={hideTooltip}
        className="w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        style={{ background: "hsl(var(--surface-inverse))", border: "1px solid hsl(var(--border))", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
        data-testid={`stack-icon-${name}`}
        aria-label={displayName}
        aria-describedby={tooltip ? `tooltip-${name}` : undefined}
      >
        {isPterodactyl ? (
          <img src={PORTFOLIO_CONFIG.pterodactylLogoUrl} alt="" aria-hidden="true" className="w-5 h-5 object-contain" loading="lazy" draggable={false} />
        ) : (
          <StackIcon name={name} variant="dark" className="w-5 h-5" />
        )}
      </motion.button>

      <AnimatePresence>
        {tooltip && (
          <motion.div
            id={`tooltip-${name}`}
            role="tooltip"
            key={`tt-${name}`}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 6, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.15, ease: "easeOut" }}
            className="fixed z-[500] pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
          >
            <div className="px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap bg-foreground text-background shadow-lg">
              {displayName}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function StackSection() {
  const { t, lang } = useLang();
  const { settings } = usePortfolio();
  const categories = [
    { label: t.stack.programming, items: settings.techStack.programming },
    { label: t.stack.framework, items: settings.techStack.framework },
    { label: t.stack.tools, items: settings.techStack.tools }
  ];
  const pterodactylItems = ["pterodactyl"];

  return (
    <section id="stack" className="py-16 px-4 scroll-mt-20">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">{lang === "id" ? "Kemampuan utama" : "Core capabilities"}</p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}>{t.stack.title}</h2>
          <div className="w-8 h-0.5 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-blue-600 mb-3" />
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">{lang === "id" ? "Teknologi yang saya gunakan untuk membangun dan mengeksplorasi proyek." : "Technologies I use to build and explore projects."}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.08 }} className="rounded-2xl overflow-hidden surface-inverse-card">
          <div className="p-5 space-y-6">
            {categories.map((cat, ci) => (
              <motion.div key={cat.label} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: ci * 0.07, duration: 0.4 }}>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] mb-3 text-muted-foreground">{cat.label}</h3>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map(name => <TechItem key={name} name={name} isPterodactyl={pterodactylItems.includes(name.toLowerCase())} />)}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="px-5 pb-4">
            <p className="text-[10px] text-muted-foreground">{lang === "id" ? "Pilih ikon untuk melihat nama teknologi." : "Select an icon to see its technology name."}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

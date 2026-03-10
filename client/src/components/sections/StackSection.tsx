import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  const displayName = DISPLAY_NAMES[name] || (name.charAt(0).toUpperCase() + name.slice(1));

  const showTooltip = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    let x: number, y: number;
    if ("touches" in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top - 10;
    } else {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top - 10;
    }
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setTooltip({ x, y });
    hideTimer.current = setTimeout(() => setTooltip(null), 2200);
  }, []);

  const hideTooltip = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setTooltip(null);
  }, []);

  return (
    <>
      <motion.div
        whileHover={{ y: -4, scale: 1.12 }}
        whileTap={{ scale: 0.88 }}
        onClick={showTooltip}
        onTouchStart={showTooltip}
        onMouseLeave={hideTooltip}
        className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer relative"
        style={{
          background: "rgba(13,13,20,0.98)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          willChange: "transform"
        }}
        data-testid={`stack-icon-${name}`}
        title={displayName}
      >
        {isPterodactyl ? (
          <img src={PORTFOLIO_CONFIG.pterodactylLogoUrl} alt="Pterodactyl" className="w-5 h-5 object-contain" draggable={false} />
        ) : (
          <StackIcon name={name} variant="dark" className="w-5 h-5" />
        )}
      </motion.div>

      <AnimatePresence>
        {tooltip && (
          <motion.div
            key={`tt-${name}`}
            initial={{ opacity: 0, y: 6, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed z-[500] pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
          >
            <div
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
              style={{
                background: "rgba(5,5,8,0.97)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.95)",
                boxShadow: "0 4px 18px rgba(0,0,0,0.6)"
              }}
            >
              {displayName}
            </div>
            <div className="flex justify-center -mt-1">
              <div className="w-2 h-2 rotate-45" style={{ background: "rgba(5,5,8,0.97)", borderRight: "1px solid rgba(255,255,255,0.15)", borderBottom: "1px solid rgba(255,255,255,0.15)" }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function StackSection() {
  const { t } = useLang();
  const { settings } = usePortfolio();
  const categories = [
    { label: t.stack.programming, items: settings.techStack.programming },
    { label: t.stack.framework, items: settings.techStack.framework },
    { label: t.stack.tools, items: settings.techStack.tools }
  ];
  const pterodactylItems = ["pterodactyl"];

  return (
    <section id="stack" className="py-14 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}>
            {t.stack.title}
          </h2>
          <div className="w-8 h-0.5 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-blue-600 mb-3" />
          <p className="text-xs text-muted-foreground max-w-sm mx-auto italic">{t.stack.subtitle}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(7,7,12,0.98)", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}
        >
          <div className="p-5 space-y-6">
            {categories.map((cat, ci) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: ci * 0.07, duration: 0.4 }}
              >
                <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: "rgba(255,255,255,0.28)" }}>
                  {cat.label}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map(name => (
                    <TechItem key={name} name={name} isPterodactyl={pterodactylItems.includes(name.toLowerCase())} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="px-5 pb-3">
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
              💡 Tap icon to see name
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

import { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/LangContext";
import { usePortfolio } from "@/lib/PortfolioContext";

export default function FriendsSection() {
  const { t } = useLang();
  const { settings } = usePortfolio();
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const posRef = useRef(0);
  const lastManualRef = useRef(0);

  const animate = useCallback(() => {
    if (scrollRef.current && !isPausedRef.current) {
      posRef.current += 0.45;
      const max = scrollRef.current.scrollWidth / 2;
      if (posRef.current >= max) posRef.current = 0;
      scrollRef.current.scrollLeft = posRef.current;
    }
    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [animate]);

  const pause = () => {
    isPausedRef.current = true;
    lastManualRef.current = Date.now();
    if (scrollRef.current) posRef.current = scrollRef.current.scrollLeft;
  };

  const resume = () => {
    setTimeout(() => {
      if (Date.now() - lastManualRef.current >= 1200) isPausedRef.current = false;
    }, 1200);
  };

  const doubled = [...settings.friends, ...settings.friends];

  return (
    <section id="friends" className="py-14 overflow-hidden">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 px-4"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}>
            {t.friends.title}
          </h2>
          <div className="w-8 h-0.5 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-blue-600 mb-2.5" />
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">{t.friends.subtitle}</p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, hsl(var(--background)), transparent)" }} />
          <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, hsl(var(--background)), transparent)" }} />

          <div
            ref={scrollRef}
            className="flex gap-2.5 overflow-x-hidden py-3 px-4"
            style={{ scrollbarWidth: "none" }}
            onMouseEnter={pause}
            onMouseLeave={resume}
            onTouchStart={pause}
            onTouchEnd={resume}
          >
            {doubled.map((friend, i) => (
              <motion.div
                key={`${friend}-${i}`}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap"
                style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))", color: "hsl(var(--card-foreground))" }}
                data-testid={`friend-card-${i}`}
              >
                {friend}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

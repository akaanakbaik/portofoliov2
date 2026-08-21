import { useCallback, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLang } from "@/lib/LangContext";
import { usePortfolio } from "@/lib/PortfolioContext";

export default function FriendsSection() {
  const { t } = useLang();
  const { settings } = usePortfolio();
  const shouldReduceMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausedRef = useRef(false);
  const isAutoWritingRef = useRef(false);
  const posRef = useRef(0);
  const lastManualRef = useRef(0);

  const syncManualPosition = useCallback(() => {
    if (!scrollRef.current || isAutoWritingRef.current) return;
    posRef.current = scrollRef.current.scrollLeft;
    lastManualRef.current = Date.now();
    isPausedRef.current = true;
  }, []);

  const scheduleResume = useCallback(() => {
    if (shouldReduceMotion) return;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      if (!scrollRef.current) return;
      if (Date.now() - lastManualRef.current >= 850) {
        posRef.current = scrollRef.current.scrollLeft;
        isPausedRef.current = false;
      }
    }, 900);
  }, [shouldReduceMotion]);

  const animate = useCallback(() => {
    const container = scrollRef.current;
    if (container && !isPausedRef.current && !shouldReduceMotion) {
      const max = Math.max(container.scrollWidth / 2, 1);
      posRef.current = posRef.current >= max ? 0 : posRef.current + 0.55;
      isAutoWritingRef.current = true;
      container.scrollLeft = posRef.current;
      isAutoWritingRef.current = false;
    }
    if (!shouldReduceMotion) animRef.current = requestAnimationFrame(animate);
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [animate, shouldReduceMotion]);

  const pause = useCallback(() => {
    syncManualPosition();
    if (scrollRef.current) posRef.current = scrollRef.current.scrollLeft;
  }, [syncManualPosition]);

  const renderFriend = (friend: string, i: number) => (
    <motion.div
      key={`${friend}-${i}`}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.05, y: -2 }}
      className="flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap bg-card text-card-foreground border border-border"
      data-testid={`friend-card-${i}`}
    >
      {friend}
    </motion.div>
  );

  return (
    <section id="friends" className="py-16 overflow-hidden scroll-mt-20">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-7 px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}>{t.friends.title}</h2>
          <div className="w-8 h-0.5 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-blue-600 mb-2.5" />
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">{t.friends.subtitle}</p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none bg-gradient-to-r from-background to-transparent" aria-hidden="true" />
          <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none bg-gradient-to-l from-background to-transparent" aria-hidden="true" />
          <div
            ref={scrollRef}
            className={`flex gap-2.5 overflow-x-auto py-3 px-4 ${shouldReduceMotion ? "flex-wrap justify-center overflow-visible" : "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"}`}
            onScroll={syncManualPosition}
            onPointerDown={pause}
            onPointerUp={scheduleResume}
            onPointerCancel={scheduleResume}
            onPointerLeave={scheduleResume}
            onWheel={() => { pause(); scheduleResume(); }}
            onTouchEnd={scheduleResume}
            onKeyDown={event => {
              if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "Home" || event.key === "End") pause();
            }}
            tabIndex={0}
            data-auto-scroll={!shouldReduceMotion}
            aria-label={t.friends.title}
          >
            <div className="flex gap-2.5" role="list">
              {settings.friends.map((friend, i) => <div key={`primary-${friend}-${i}`} role="listitem">{renderFriend(friend, i)}</div>)}
            </div>
            {!shouldReduceMotion && <div className="flex gap-2.5" aria-hidden="true">
              {settings.friends.map((friend, i) => renderFriend(friend, i + settings.friends.length))}
            </div>}
          </div>
        </div>
      </div>
    </section>
  );
}

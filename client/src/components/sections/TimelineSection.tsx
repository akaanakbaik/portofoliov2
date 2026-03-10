import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/LangContext";

interface PopupInfo {
  id: string;
  x: number;
  y: number;
  year: string;
  name: string;
}

export default function TimelineSection() {
  const { t } = useLang();
  const [popup, setPopup] = useState<PopupInfo | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const positionRef = useRef(0);
  const lastTouchRef = useRef(0);

  const items = [
    { id: "sd", label: t.timeline.sd, name: t.timeline.sdName, year: t.timeline.sdYear, icon: "📚", color: "from-emerald-400 to-green-500" },
    { id: "mts", label: t.timeline.mts, name: t.timeline.mtsName, year: t.timeline.mtsYear, icon: "📖", color: "from-blue-400 to-blue-600" },
    { id: "sma", label: t.timeline.sma, name: t.timeline.smaName, year: t.timeline.smaYear, icon: "🎓", color: "from-violet-400 to-purple-600" }
  ];

  const startAutoScroll = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const scroll = () => {
      if (scrollRef.current && !isPausedRef.current) {
        positionRef.current += 0.35;
        const max = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
        if (positionRef.current >= max) positionRef.current = 0;
        scrollRef.current.scrollLeft = positionRef.current;
      }
      animFrameRef.current = requestAnimationFrame(scroll);
    };
    animFrameRef.current = requestAnimationFrame(scroll);
  }, []);

  useEffect(() => {
    startAutoScroll();
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [startAutoScroll]);

  const pause = () => {
    isPausedRef.current = true;
    lastTouchRef.current = Date.now();
    if (scrollRef.current) positionRef.current = scrollRef.current.scrollLeft;
  };

  const resume = () => {
    setTimeout(() => {
      if (Date.now() - lastTouchRef.current >= 1400) isPausedRef.current = false;
    }, 1400);
  };

  const showPopup = (e: React.MouseEvent | React.TouchEvent, item: typeof items[0]) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopup({ id: item.id, x: rect.left + rect.width / 2, y: rect.top - 10, year: item.year, name: item.name });
    setTimeout(() => setPopup(null), 2500);
  };

  return (
    <section id="timeline" className="py-14 overflow-hidden">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 px-4"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}>
            {t.timeline.title}
          </h2>
          <div className="w-8 h-0.5 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-blue-600" />
        </motion.div>

        <div
          ref={scrollRef}
          className="overflow-x-auto cursor-grab active:cursor-grabbing pb-4 px-6"
          style={{ scrollbarWidth: "none" }}
          onMouseDown={pause}
          onMouseUp={resume}
          onTouchStart={pause}
          onTouchEnd={resume}
          onScroll={() => { if (scrollRef.current) positionRef.current = scrollRef.current.scrollLeft; }}
        >
          <div className="flex items-end gap-0 py-3" style={{ minWidth: "max-content" }}>
            {items.map((item, i) => (
              <div key={item.id} className="flex items-center">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center"
                >
                  <motion.button
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={(e) => showPopup(e, item)}
                    className="rounded-xl p-4 w-48 text-center"
                    style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
                    data-testid={`timeline-${item.id}`}
                  >
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-lg mx-auto mb-2.5`}>
                      {item.icon}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-1">{item.label}</p>
                    <p className="text-xs font-semibold text-card-foreground leading-snug">{item.name}</p>
                  </motion.button>
                  <div className="mt-2.5 w-0.5 h-3 bg-border/50 rounded" />
                  <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${item.color}`} style={{ boxShadow: "0 0 6px rgba(59,130,246,0.4)" }} />
                </motion.div>

                {i < items.length - 1 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 + 0.25, duration: 0.5 }}
                    className="w-16 h-px mx-3 origin-left"
                    style={{ background: "linear-gradient(to right, hsl(var(--border)), hsl(var(--border)/0.3))", marginBottom: 14 }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {popup && (
          <motion.div
            key="popup"
            initial={{ opacity: 0, y: 6, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.93 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed z-[200] pointer-events-none"
            style={{ left: popup.x, top: popup.y, transform: "translate(-50%, -100%)" }}
          >
            <div className="px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap" style={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--popover-border))", color: "hsl(var(--popover-foreground))", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
              <p className="font-bold text-primary">{popup.year}</p>
              <p className="text-muted-foreground">{popup.name}</p>
            </div>
            <div className="flex justify-center">
              <div className="w-2 h-2 rotate-45 -mt-1.5" style={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--popover-border))", borderTop: "none", borderLeft: "none" }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

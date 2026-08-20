import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLang } from "@/lib/LangContext";
import { usePortfolio } from "@/lib/PortfolioContext";

export default function HomeSection() {
  const { lang } = useLang();
  const { settings } = usePortfolio();
  const shouldReduceMotion = useReducedMotion();
  const statuses = settings.statusTexts[lang] || settings.statusTexts.id;
  const [displayText, setDisplayText] = useState("");
  const [statusIndex, setStatusIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayText(statuses[0] || "");
      return;
    }
    const current = statuses[statusIndex] || "";
    const speed = isDeleting ? 50 : 85;
    if (!isDeleting && displayText === current) {
      timeoutRef.current = setTimeout(() => setIsDeleting(true), 2200);
      return;
    }
    if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setStatusIndex(i => (i + 1) % Math.max(statuses.length, 1));
      return;
    }
    timeoutRef.current = setTimeout(() => {
      setDisplayText(isDeleting ? current.slice(0, displayText.length - 1) : current.slice(0, displayText.length + 1));
    }, speed);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [displayText, isDeleting, statusIndex, statuses, shouldReduceMotion]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth", block: "start" });
  };

  return (
    <section
      id="home"
      className="flex items-center justify-center relative overflow-hidden scroll-mt-20"
      style={{ minHeight: "calc(100vh - 3.5rem)", marginTop: "3.5rem" }}
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {!shouldReduceMotion && <>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.12, 0.05] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, hsl(217 91% 60% / 0.4), transparent 70%)", filter: "blur(80px)", willChange: "transform, opacity" }}
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.04, 0.08, 0.04] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, hsl(250 70% 65% / 0.3), transparent 70%)", filter: "blur(70px)", willChange: "transform, opacity" }}
          />
        </>}
      </div>

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto py-16">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.7, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="relative inline-block mb-6"
        >
          {!shouldReduceMotion && <motion.div
            animate={{ opacity: [0.25, 0.6, 0.25] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-4 rounded-full"
            style={{ background: "radial-gradient(circle, hsl(217 91% 58% / 0.18), transparent 70%)", filter: "blur(18px)", willChange: "opacity" }}
          />}
          <img
            src={settings.photoUrl}
            alt={`${settings.name}, ${lang === "id" ? "pelajar dan developer web dari Sumatera Barat" : "student and web developer from West Sumatra"}`}
            data-testid="profile-photo"
            width="144"
            height="144"
            fetchPriority="high"
            className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover object-top relative z-10"
            style={{ border: "2.5px solid hsl(217 91% 60% / 0.4)", boxShadow: "0 0 0 6px hsl(217 91% 60% / 0.06), 0 8px 36px rgba(0,0,0,0.28)" }}
          />
        </motion.div>

        <motion.h1
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          data-testid="profile-name"
          className="text-3xl md:text-5xl font-bold mb-4 text-foreground tracking-tight"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {lang === "id" ? `Saya ${settings.name}.` : `I'm ${settings.name}.`}
        </motion.h1>

        <motion.p
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl mx-auto text-base md:text-lg leading-relaxed text-muted-foreground"
        >
          {lang === "id" ? "Pelajar dan pembuat produk web dari Sumatera Barat yang belajar melalui proyek nyata." : "A student and web maker from West Sumatra, learning through real-world projects."}
        </motion.p>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.54, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-3 mt-7 flex-wrap"
        >
          <button type="button" onClick={() => scrollTo("projects")} className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            {lang === "id" ? "Lihat Proyek" : "View Projects"}
          </button>
          <button type="button" onClick={() => scrollTo("contact")} className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold border border-border bg-background/70 text-foreground hover:bg-accent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            {lang === "id" ? "Hubungi Saya" : "Contact Me"}
          </button>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.82, duration: 1 }}
          className="mt-8 flex items-center justify-center gap-1.5 h-7"
          data-testid="typing-status"
          aria-label={lang === "id" ? "Status" : "Status"}
        >
          <span className="text-sm md:text-base font-medium" style={{ color: "hsl(217 91% 62%)" }}>{displayText}</span>
          {!shouldReduceMotion && <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }} style={{ color: "hsl(217 91% 62%)" }} className="font-light">|</motion.span>}
        </motion.div>
      </div>
    </section>
  );
}

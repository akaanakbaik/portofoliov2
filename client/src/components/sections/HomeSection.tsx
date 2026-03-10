import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/LangContext";
import { usePortfolio } from "@/lib/PortfolioContext";

export default function HomeSection() {
  const { lang } = useLang();
  const { settings } = usePortfolio();
  const statuses = settings.statusTexts[lang] || settings.statusTexts.id;
  const [displayText, setDisplayText] = useState("");
  const [statusIndex, setStatusIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const current = statuses[statusIndex];
    const speed = isDeleting ? 50 : 85;
    if (!isDeleting && displayText === current) {
      timeoutRef.current = setTimeout(() => setIsDeleting(true), 2200);
      return;
    }
    if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setStatusIndex(i => (i + 1) % statuses.length);
      return;
    }
    timeoutRef.current = setTimeout(() => {
      setDisplayText(isDeleting ? current.slice(0, displayText.length - 1) : current.slice(0, displayText.length + 1));
    }, speed);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [displayText, isDeleting, statusIndex, statuses]);

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-14">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
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
      </div>

      <div className="relative z-10 text-center px-4 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="relative inline-block mb-5"
        >
          <motion.div
            animate={{ opacity: [0.25, 0.6, 0.25] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-4 rounded-full"
            style={{ background: "radial-gradient(circle, hsl(217 91% 58% / 0.18), transparent 70%)", filter: "blur(18px)", willChange: "opacity" }}
          />
          <img
            src={settings.photoUrl}
            alt={settings.name}
            data-testid="profile-photo"
            className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover object-top relative z-10"
            style={{
              border: "2.5px solid hsl(217 91% 60% / 0.4)",
              boxShadow: "0 0 0 6px hsl(217 91% 60% / 0.06), 0 8px 36px rgba(0,0,0,0.28)"
            }}
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          data-testid="profile-name"
          className="text-3xl md:text-4xl font-bold mb-3 text-foreground"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}
        >
          {settings.name}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-0.5 h-7"
          data-testid="typing-status"
        >
          <span className="text-sm md:text-base font-medium" style={{ color: "hsl(217 91% 62%)" }}>
            {displayText}
          </span>
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ color: "hsl(217 91% 62%)" }}
            className="font-light ml-0.5"
          >|</motion.span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-12"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-muted-foreground/35 flex justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

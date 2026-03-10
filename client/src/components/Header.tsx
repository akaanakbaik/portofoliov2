import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { useLang } from "@/lib/LangContext";
import { usePortfolio } from "@/lib/PortfolioContext";

interface HeaderProps {
  onMenuClick: () => void;
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function IDFlag() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: 2, display: "block" }}>
      <rect width="20" height="7" fill="#CE1126"/>
      <rect y="7" width="20" height="7" fill="#FFFFFF"/>
    </svg>
  );
}

function ENFlag() {
  return (
    <svg width="20" height="14" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: 2, display: "block" }}>
      <rect width="60" height="40" fill="#012169"/>
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="white" strokeWidth="8"/>
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="5"/>
      <path d="M30,0 V40 M0,20 H60" stroke="white" strokeWidth="13"/>
      <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="8"/>
    </svg>
  );
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang } = useLang();
  const { settings } = usePortfolio();
  const [themeAnimating, setThemeAnimating] = useState(false);
  const [langAnimating, setLangAnimating] = useState(false);

  const handleThemeToggle = () => {
    setThemeAnimating(true);
    setTimeout(() => setThemeAnimating(false), 400);
    toggleTheme();
  };

  const handleLangToggle = () => {
    setLangAnimating(true);
    setTimeout(() => setLangAnimating(false), 400);
    toggleLang();
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 h-14"
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-b border-border/50" />
      <div className="relative max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        <motion.button
          data-testid="sidebar-toggle"
          onClick={onMenuClick}
          className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-accent/60 transition-all duration-200"
          whileTap={{ scale: 0.92 }}
          aria-label="Toggle menu"
        >
          <span className="block w-5 h-0.5 bg-foreground/80 rounded-full" />
          <span className="block w-5 h-0.5 bg-foreground/80 rounded-full" />
          <span className="block w-5 h-0.5 bg-foreground/80 rounded-full" />
        </motion.button>

        <motion.span
          className="text-base font-bold tracking-wide text-foreground select-none"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {settings.name}
        </motion.span>

        <div className="flex items-center gap-2">
          <motion.button
            data-testid="lang-toggle"
            onClick={handleLangToggle}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent/40 hover:bg-accent/80 border border-border/50 transition-all duration-200"
            whileTap={{ scale: 0.92 }}
            aria-label="Toggle language"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={lang}
                initial={{ scale: 0.7, opacity: 0, rotateY: -90 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ scale: 0.7, opacity: 0, rotateY: 90 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ lineHeight: 0 }}
              >
                {lang === "id" ? <IDFlag /> : <ENFlag />}
              </motion.div>
            </AnimatePresence>
            <span className="text-xs font-semibold text-foreground/80 uppercase">{lang}</span>
          </motion.button>

          <motion.button
            data-testid="theme-toggle"
            onClick={handleThemeToggle}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-accent/40 hover:bg-accent/80 border border-border/50 transition-all duration-200 text-foreground/80"
            whileTap={{ scale: 0.92 }}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

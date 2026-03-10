import { useRef } from "react";
import { useLocation } from "wouter";
import { useLang } from "@/lib/LangContext";
import { PORTFOLIO_CONFIG } from "@/lib/config";

export default function Footer() {
  const { t } = useLang();
  const [, navigate] = useLocation();
  const clickCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSecretClick = () => {
    clickCountRef.current += 1;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { clickCountRef.current = 0; }, 4300);
    if (clickCountRef.current >= 10) {
      clickCountRef.current = 0;
      if (timerRef.current) clearTimeout(timerRef.current);
      navigate(PORTFOLIO_CONFIG.adminPath);
    }
  };

  return (
    <footer className="py-7 border-t border-border/40">
      <div className="max-w-5xl mx-auto px-4 text-center space-y-1">
        <p className="text-sm text-muted-foreground">
          <span role="button" tabIndex={-1} onClick={handleSecretClick} className="cursor-default select-none">
            © 2026 Aka
          </span>
        </p>
        <p className="text-xs text-muted-foreground/50">{t.footer.built}</p>
      </div>
    </footer>
  );
}

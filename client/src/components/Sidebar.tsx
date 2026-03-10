import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/LangContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
}

const navItems = [
  { key: "home", icon: "🏠" },
  { key: "about", icon: "👤" },
  { key: "timeline", icon: "📅" },
  { key: "projects", icon: "💼" },
  { key: "friends", icon: "👥" },
  { key: "contact", icon: "✉️" }
];

export default function Sidebar({ isOpen, onClose, activeSection }: SidebarProps) {
  const { t } = useLang();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[60] bg-black/35 backdrop-blur-[3px]"
            onClick={onClose}
          />
          <motion.aside
            key="sidebar"
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 top-0 bottom-0 z-[70] w-60 flex flex-col"
            style={{
              background: "hsl(var(--sidebar))",
              borderRight: "1px solid hsl(var(--sidebar-border))"
            }}
          >
            <div className="px-5 pt-5 pb-4 border-b border-sidebar-border/60">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-0.5">Navigation</p>
              <p className="text-sm font-bold text-sidebar-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Portfolio</p>
            </div>

            <nav className="flex-1 p-3 space-y-0.5" data-testid="sidebar-nav">
              {navItems.map((item, i) => {
                const label = t.nav[item.key as keyof typeof t.nav];
                const isActive = activeSection === item.key;
                return (
                  <motion.button
                    key={item.key}
                    data-testid={`nav-${item.key}`}
                    initial={{ x: -24, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.3, ease: "easeOut" }}
                    onClick={() => scrollTo(item.key)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left transition-all duration-200 ${
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                    whileTap={{ scale: 0.96 }}
                  >
                    <span className="text-sm">{item.icon}</span>
                    <span className="text-sm font-medium">{label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80"
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>

            <div className="px-5 py-4 border-t border-sidebar-border/60">
              <p className="text-[10px] text-muted-foreground/50 text-center">© 2026 aka — portfolio</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

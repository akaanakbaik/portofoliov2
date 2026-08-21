import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { usePortfolio, type PortfolioSettings, type ProjectItem, type PlaylistItem } from "@/lib/PortfolioContext";
import { useLang } from "@/lib/LangContext";
import { useToast } from "@/hooks/use-toast";
import { PORTFOLIO_CONFIG, calculateAge } from "@/lib/config";
import StackIcon from "tech-stack-icons";
import { SvgIcon, type SvgIconName } from "@/components/SvgIcon";
import { SchoolLogo } from "@/components/SchoolLogo";

// ── Auth helpers ───────────────────────────────────────────────────────────────
const getAdminToken = () => sessionStorage.getItem("aka-admin-token") || "";
const adminHeaders = () => ({ "Content-Type": "application/json", "X-Admin-Token": getAdminToken() });

// ── Constants ──────────────────────────────────────────────────────────────────
const TABS = ["analytics", "home", "about", "tech", "projects", "friends", "social", "audio", "settings"] as const;
type Tab = typeof TABS[number];

interface VisitorStats { total: number; today: number; history: { date: string; count: number }[]; generatedAt?: string }
interface LangStat { language: string; lines: number; percentage: number; color: string }
interface ContactMsg { id: string; name: string; email: string; message: string; timestamp: string; read: boolean }
interface AdminHealth { ok: boolean; generatedAt: string; uptimeSeconds: number; adminPasswordConfigured: boolean; emailConfigured: boolean; statsStorage: string; messagesStorage: string; lastVisitDate: string | null }

const TAB_CONFIG: { key: Tab; icon: SvgIconName; label: string }[] = [
  { key: "analytics", icon: "analytics", label: "Analitik" },
  { key: "home",      icon: "home", label: "Beranda"  },
  { key: "about",     icon: "user", label: "Tentang"  },
  { key: "tech",      icon: "code", label: "Framework" },
  { key: "projects",  icon: "briefcase", label: "Proyek"   },
  { key: "friends",   icon: "users", label: "Teman"    },
  { key: "social",    icon: "link", label: "Medsos"   },
  { key: "audio",     icon: "music", label: "Audio"    },
  { key: "settings",  icon: "settings", label: "Setting"  },
];

// ── Shared UI components ───────────────────────────────────────────────────────
const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10";

function IconText({ icon, children }: { icon: SvgIconName; children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-2"><SvgIcon name={icon} size={16} aria-hidden="true" />{children}</span>;
}

function Card({ title, subtitle, badge, children }: { title: React.ReactNode; subtitle?: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}>
      <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {badge}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, row, children }: { label: string; hint?: string; row?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-semibold text-foreground/65 uppercase tracking-wide">{label}</label>
          {hint && <span className="text-[10px] text-muted-foreground bg-accent px-1.5 py-0.5 rounded-md font-medium">{hint}</span>}
        </div>
        {row}
      </div>
      {children}
    </div>
  );
}

function SaveBar({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  return (
    <div className="flex items-center gap-2 pt-4 border-t border-border/40 mt-2">
      <motion.button whileTap={{ scale: 0.95 }} onClick={onSave} data-testid="admin-save"
        className="px-5 py-2.5 rounded-xl text-xs font-bold" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white" }}>
        Simpan Perubahan
      </motion.button>
      <motion.button whileTap={{ scale: 0.95 }} onClick={onCancel} data-testid="admin-cancel"
        className="px-4 py-2.5 rounded-xl text-xs font-medium bg-secondary text-secondary-foreground">
        Batal
      </motion.button>
    </div>
  );
}

// Auto-translate helper
async function autoTranslate(text: string): Promise<string | null> {
  try {
    const res = await fetch("/api/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
    if (!res.ok) return null;
    const d = await res.json();
    return d.result || null;
  } catch { return null; }
}

function TranslateBtn({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <motion.button type="button" whileTap={{ scale: 0.93 }} onClick={onClick} disabled={loading}
      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all flex-shrink-0"
      style={{ background: loading ? "hsl(var(--muted))" : "rgba(59,130,246,0.12)", color: loading ? "hsl(var(--muted-foreground))" : "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}
      title="Auto translate ID → EN">
      {loading ? (
        <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} className="block w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
      ) : (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/>
          <path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/>
        </svg>
      )}
      ID→EN
    </motion.button>
  );
}

// ── Main Admin component ───────────────────────────────────────────────────────
export default function Admin() {
  const [, navigate] = useLocation();
  const { settings, updateSettings, resetSettings } = usePortfolio();
  const { t } = useLang();
  const { toast } = useToast();

  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [wrongPw, setWrongPw] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<Tab>("analytics");
  const [activeBubble, setActiveBubble] = useState<Tab | null>(null);
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [langStats, setLangStats] = useState<LangStat[]>([]);
  const [messages, setMessages] = useState<ContactMsg[]>([]);
  const [health, setHealth] = useState<AdminHealth | null>(null);
  const [lastAnalyticsSync, setLastAnalyticsSync] = useState<Date | null>(null);
  const [draft, setDraft] = useState<PortfolioSettings>({ ...settings });
  const [refreshing, setRefreshing] = useState(false);

  // Unsaved changes tracker
  const [unsavedTabs, setUnsavedTabs] = useState<Set<Tab>>(new Set());
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setRefreshing(true);
    try {
      const token = getAdminToken();
      const hdr = { "X-Admin-Token": token };
      const [s, l, m, h] = await Promise.all([
        fetch("/api/analytics/stats").then(r => r.json()).catch(() => null),
        fetch("/api/analytics/lang-stats").then(r => r.json()).catch(() => []),
        fetch("/api/messages", { headers: hdr }).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch("/api/admin/health", { headers: hdr }).then(r => r.ok ? r.json() : null).catch(() => null)
      ]);
      if (s) setStats(s);
      if (Array.isArray(l)) setLangStats(l);
      if (Array.isArray(m)) setMessages(m);
      if (h) setHealth(h);
    } catch {}
    setLastAnalyticsSync(new Date());
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") fetchAnalytics();
    }, 30000);
    return () => window.clearInterval(interval);
  }, [authenticated, fetchAnalytics]);

  // Check existing session on mount
  useEffect(() => {
    const token = sessionStorage.getItem("aka-admin-token");
    if (!token) { setSessionLoading(false); return; }
    fetch("/api/admin/check", { headers: { "X-Admin-Token": token } })
      .then(r => r.json())
      .then(d => { if (d.ok) setAuthenticated(true); })
      .catch(() => {})
      .finally(() => setSessionLoading(false));
  }, []);

  useEffect(() => { if (authenticated) fetchAnalytics(); }, [authenticated, fetchAnalytics]);

  useEffect(() => {
    setDraft({ ...settings });
    setUnsavedTabs(new Set());
  }, [settings]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (unsavedTabs.size > 0) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [unsavedTabs.size]);

  // Track unsaved changes per tab
  const handleDraftChange = (updater: (d: PortfolioSettings) => PortfolioSettings) => {
    setDraft(updater);
    setUnsavedTabs(prev => new Set(Array.from(prev).concat([activeTab])));
  };

  const handleLogin = async () => {
    if (!password.trim()) return;
    setLoginLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.ok && data.token) {
        sessionStorage.setItem("aka-admin-token", data.token);
        setAuthenticated(true);
      } else {
        setWrongPw(true);
        setTimeout(() => setWrongPw(false), 2500);
        toast({ title: res.status === 429 ? data.error : "Password salah", variant: "destructive" });
      }
    } catch {
      toast({ title: "Koneksi gagal. Coba lagi.", variant: "destructive" });
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    fetch("/api/admin/logout", { method: "POST", headers: adminHeaders() }).catch(() => {});
    sessionStorage.removeItem("aka-admin-token");
    setAuthenticated(false);
  };

  const saveChanges = () => {
    updateSettings(draft);
    setUnsavedTabs(new Set());
    setLastSavedAt(new Date());
    toast({ title: "Tersimpan", description: "Perubahan berhasil disimpan" });
  };

  const cancelChanges = () => {
    setDraft({ ...settings });
    setUnsavedTabs(new Set());
    toast({ title: "Dibatalkan" });
  };

  const saveAllChanges = () => {
    if (unsavedTabs.size === 0) return;
    saveChanges();
  };

  const selectTab = (tab: Tab) => {
    setActiveTab(tab);
    setActiveBubble(tab);
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => setActiveBubble(null), 1800);
  };

  useEffect(() => () => {
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
  }, []);

  // ── Session loading screen ────────────────────────────────────────────────
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(var(--background))" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "hsl(var(--background))" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm rounded-2xl p-8"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))", boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}
        >
          <div className="text-center mb-7">
            <motion.div
              className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
              animate={{ boxShadow: wrongPw ? "0 0 0 3px rgba(239,68,68,0.3)" : "0 0 0 3px rgba(59,130,246,0.2)" }}
              transition={{ duration: 0.3 }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </motion.div>
            <h1 className="text-lg font-bold text-foreground">Admin Portal</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Masukkan password untuk melanjutkan</p>
          </div>

          <div className="space-y-3">
            <motion.div
              animate={{ x: wrongPw ? [0, -6, 6, -4, 4, 0] : 0 }}
              transition={{ duration: 0.4 }}
              className="relative"
            >
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="Password rahasia..."
                aria-label="Password admin"
                data-testid="admin-password-input"
                autoFocus
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none"
                style={{
                  background: "hsl(var(--background))",
                  border: `1.5px solid ${wrongPw ? "hsl(var(--destructive))" : "hsl(var(--border))"}`,
                  color: "hsl(var(--foreground))",
                  transition: "border-color 0.2s"
                }}
              />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <EyeIcon open={showPw} />
              </button>
            </motion.div>

            <AnimatePresence>
              {wrongPw && (
                <motion.div initial={{ opacity: 0, y: -4, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-1.5 text-xs text-destructive justify-center font-medium">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  Password salah. Coba lagi.
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleLogin}
              disabled={loginLoading || !password}
              data-testid="admin-login-btn"
              className="w-full py-3 rounded-xl text-sm font-bold"
              style={{
                background: !password || loginLoading ? "hsl(var(--muted))" : "linear-gradient(135deg, #3b82f6, #6366f1)",
                color: !password || loginLoading ? "hsl(var(--muted-foreground))" : "white",
                cursor: !password || loginLoading ? "not-allowed" : "pointer"
              }}
            >
              {loginLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} className="block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  Memverifikasi...
                </span>
              ) : "Masuk"}
            </motion.button>
            <button onClick={() => navigate("/")} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
              ← Kembali ke Portfolio
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const unreadCount = messages.filter(m => !m.read).length;

  // ── Main dashboard ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground leading-tight">Admin Dashboard</p>
                <p className="text-[10px] text-muted-foreground leading-tight">Portfolio aka</p>
              </div>
            </div>
              <div className="flex items-center gap-1.5">
                {unsavedTabs.size > 0 && (
                  <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Belum disimpan
                  </div>
                )}
                {lastSavedAt && unsavedTabs.size === 0 && <span className="hidden lg:inline text-[10px] text-muted-foreground">Tersimpan {lastSavedAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>}
                {unsavedTabs.size > 0 && <button onClick={saveAllChanges} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>Simpan Semua</button>}
                <button onClick={() => navigate("/")} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-accent-foreground hover:bg-accent/80 transition-all">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Portfolio
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: "hsl(var(--destructive)/0.1)", color: "hsl(var(--destructive))" }}
                data-testid="admin-logout"
              >
                Logout
              </motion.button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-0.5 pb-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {TAB_CONFIG.map(tab => {
              const isBadge = tab.key === "analytics" && unreadCount > 0;
              const hasUnsaved = unsavedTabs.has(tab.key);
              return (
                <div key={tab.key} className="relative flex-shrink-0">
                  <button
                    onClick={() => selectTab(tab.key)}
                    onFocus={() => selectTab(tab.key)}
                    data-testid={`admin-tab-${tab.key}`}
                    aria-label={tab.label}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all relative"
                    style={{
                      background: activeTab === tab.key ? "hsl(var(--primary))" : "transparent",
                      color: activeTab === tab.key ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))"
                    }}
                  >
                    <SvgIcon name={tab.icon} size={14} aria-hidden="true" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {isBadge && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center z-10" style={{ background: "#ef4444", color: "white" }}>{unreadCount > 9 ? "9+" : unreadCount}</span>}
                    {!isBadge && hasUnsaved && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  </button>
                  <AnimatePresence>
                    {activeBubble === tab.key && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.92 }}
                        transition={{ duration: 0.16 }}
                        role="tooltip"
                        className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] -translate-x-1/2 z-[70] whitespace-nowrap rounded-xl px-2.5 py-1.5 text-[10px] font-semibold text-white"
                        style={{ background: "rgba(15,23,42,0.78)", border: "1px solid rgba(148,163,184,0.24)", boxShadow: "0 10px 30px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.12)", backdropFilter: "blur(16px) saturate(140%)" }}
                      >
                        {tab.label}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {activeTab === "analytics" && <AnalyticsTab stats={stats} langStats={langStats} messages={messages} setMessages={setMessages} health={health} lastSync={lastAnalyticsSync} onRefresh={fetchAnalytics} refreshing={refreshing} />}
            {activeTab === "home"      && <HomeTab draft={draft} setDraft={handleDraftChange} onSave={saveChanges} onCancel={cancelChanges} />}
            {activeTab === "about"     && <AboutTab draft={draft} setDraft={handleDraftChange} onSave={saveChanges} onCancel={cancelChanges} />}
            {activeTab === "tech"      && <TechTab draft={draft} setDraft={handleDraftChange} onSave={saveChanges} onCancel={cancelChanges} />}
            {activeTab === "projects"  && <ProjectsTab draft={draft} setDraft={handleDraftChange} onSave={saveChanges} onCancel={cancelChanges} />}
            {activeTab === "friends"   && <FriendsTab draft={draft} setDraft={handleDraftChange} onSave={saveChanges} onCancel={cancelChanges} />}
            {activeTab === "social"    && <SocialTab draft={draft} setDraft={handleDraftChange} onSave={saveChanges} onCancel={cancelChanges} />}
            {activeTab === "audio"     && <AudioTab draft={draft} setDraft={handleDraftChange} onSave={saveChanges} onCancel={cancelChanges} />}
            {activeTab === "settings"  && <SettingsTab draft={draft} setDraft={handleDraftChange} onSave={saveChanges} onCancel={cancelChanges} onReset={resetSettings} onLogout={handleLogout} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Eye icon ───────────────────────────────────────────────────────────────────
function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {open ? (
        <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
      ) : (
        <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      )}
    </svg>
  );
}

// ── Analytics Tab ──────────────────────────────────────────────────────────────
function AnalyticsTab({ stats, langStats, messages, setMessages, health, lastSync, onRefresh, refreshing }: {
  stats: VisitorStats | null; langStats: LangStat[]; messages: ContactMsg[];
  setMessages: (m: ContactMsg[]) => void; health: AdminHealth | null; lastSync: Date | null;
  onRefresh: () => void; refreshing: boolean;
}) {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterUnread, setFilterUnread] = useState(false);
  const [messageQuery, setMessageQuery] = useState("");
  const [sortNewest, setSortNewest] = useState(true);

  const maxVisit = stats?.history?.length ? Math.max(...stats.history.map(h => h.count), 1) : 1;
  const unread = messages.filter(m => !m.read).length;

  const statCards = [
    { label: "Total Kunjungan", value: stats?.total ?? "—", icon: "eye" as SvgIconName, color: "#3b82f6" },
    { label: "Hari Ini",        value: stats?.today ?? "—", icon: "calendar" as SvgIconName, color: "#10b981" },
    { label: "Hari Aktif",      value: stats?.history?.filter(h => h.count > 0).length ?? "—", icon: "calendar-range" as SvgIconName, color: "#f59e0b" },
    { label: "Pesan Masuk",     value: messages.length,     icon: "mail" as SvgIconName, color: "#8b5cf6", badge: unread > 0 ? unread : undefined },
  ];

  const markRead = async (id: string) => {
    setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m));
    await fetch(`/api/messages/${id}/read`, { method: "PATCH", headers: { "X-Admin-Token": getAdminToken() } });
  };

  const markAllRead = async () => {
    const unreadIds = messages.filter(m => !m.read).map(m => m.id);
    setMessages(messages.map(m => ({ ...m, read: true })));
    await Promise.all(unreadIds.map(id =>
      fetch(`/api/messages/${id}/read`, { method: "PATCH", headers: { "X-Admin-Token": getAdminToken() } })
    ));
    toast({ title: "Semua pesan ditandai dibaca" });
  };

  const deleteMsg = async (id: string) => {
    setDeletingId(id);
    await fetch(`/api/messages/${id}`, { method: "DELETE", headers: { "X-Admin-Token": getAdminToken() } });
    setMessages(messages.filter(m => m.id !== id));
    setDeletingId(null);
  };

  const filteredMsgs = messages
    .filter(m => !filterUnread || !m.read)
    .filter(m => !messageQuery.trim() || `${m.name} ${m.email} ${m.message}`.toLowerCase().includes(messageQuery.toLowerCase()))
    .sort((a, b) => sortNewest ? new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime() : new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const exportMessages = () => {
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows = [
      ["Nama", "Email", "Pesan", "Waktu", "Status"],
      ...filteredMsgs.map(m => [m.name, m.email, m.message, new Date(m.timestamp).toLocaleString("id-ID"), m.read ? "Dibaca" : "Belum dibaca"])
    ];
    const csv = rows.map(row => row.map(value => escapeCsv(value)).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aka-messages-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Pesan diekspor", description: `${filteredMsgs.length} pesan masuk ke file CSV` });
  };

  const exportAnalytics = () => {
    const payload = { exportedAt: new Date().toISOString(), stats, langStats, messages, health };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aka-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Analytics diekspor", description: "Snapshot data server berhasil diunduh" });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">Statistik kunjungan & pesan masuk</p>
          <p className="text-[10px] text-muted-foreground/70 mt-0.5">{lastSync ? `Sinkron ${lastSync.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : "Belum tersinkron"} · auto-refresh 30 detik</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={exportAnalytics} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent text-accent-foreground hover:bg-accent/80 transition-all"><SvgIcon name="download" size={12} aria-hidden="true" />JSON</button>
          <button onClick={onRefresh} disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: "hsl(var(--accent))", color: "hsl(var(--foreground))" }}
            data-testid="refresh-analytics">
            <motion.span animate={refreshing ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.6, repeat: refreshing ? Infinity : 0, ease: "linear" }}><SvgIcon name="refresh" size={12} aria-hidden="true" /></motion.span>
            {refreshing ? "Memuat..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {[
          { label: "API", value: health?.ok ? "Online" : "Belum terhubung", color: health?.ok ? "#22c55e" : "#f59e0b" },
          { label: "Email", value: health?.emailConfigured ? "Siap" : "Belum dikonfigurasi", color: health?.emailConfigured ? "#22c55e" : "#f59e0b" },
          { label: "Pesan", value: health?.messagesStorage === "memory-instance" ? "Instance aktif" : "Persisten", color: health?.messagesStorage === "memory-instance" ? "#f59e0b" : "#22c55e" },
          { label: "Uptime", value: health ? `${Math.floor(health.uptimeSeconds / 60)}m` : "—", color: "#60a5fa" }
        ].map(item => <div key={item.label} className="rounded-xl px-3 py-2.5 flex items-center justify-between gap-2" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}><span className="text-[10px] text-muted-foreground">{item.label}</span><span className="text-[10px] font-bold" style={{ color: item.color }}>{item.value}</span></div>)}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl p-4 relative" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
            data-testid={`stat-card-${i}`}>
            <div className="flex items-start justify-between mb-2">
              <SvgIcon name={s.icon} size={22} className="text-foreground/80" aria-hidden="true" />
              <div className="w-2 h-2 rounded-full" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
            {s.badge && (
              <span className="absolute top-2 right-6 w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: "#ef4444", color: "white" }}>
                {Number(s.badge) > 9 ? "9+" : s.badge}
              </span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Visit history */}
      {stats?.history && stats.history.length > 0 && (
        <Card title={<IconText icon="activity">Riwayat Kunjungan</IconText>} subtitle="30 hari terakhir (scroll)">
          <div className="space-y-2">
            {stats.history.slice(-14).reverse().map(h => (
              <div key={h.date} className="flex items-center gap-2.5">
                <span className="text-[10px] text-muted-foreground font-mono w-20 flex-shrink-0">{h.date}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden bg-accent/60">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${(h.count / maxVisit) * 100}%` }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full" style={{ background: `linear-gradient(to right, #3b82f6, #6366f1)` }}
                  />
                </div>
                <span className="text-xs font-bold text-foreground w-6 text-right tabular-nums">{h.count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Messages */}
      <Card
        title={<IconText icon="inbox">Pesan Masuk</IconText>}
        subtitle={`${unread} belum dibaca dari ${messages.length} total`}
        badge={unread > 0 ? (
          <button onClick={markAllRead} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold"
            style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
            <span className="inline-flex items-center gap-1"><SvgIcon name="check" size={12} aria-hidden="true" />Tandai semua dibaca</span>
          </button>
        ) : undefined}
      >
        {messages.length > 0 && (
          <div className="space-y-2 mb-3">
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setFilterUnread(false)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
              style={{ background: !filterUnread ? "hsl(var(--primary))" : "hsl(var(--accent))", color: !filterUnread ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))" }}>
              Semua ({messages.length})
            </button>
              <button onClick={() => setFilterUnread(true)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
                style={{ background: filterUnread ? "hsl(var(--primary))" : "hsl(var(--accent))", color: filterUnread ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))" }}>
                Belum dibaca ({unread})
              </button>
              <button onClick={exportMessages} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-accent text-accent-foreground hover:bg-accent/80 transition-all">
                <span className="inline-flex items-center gap-1"><SvgIcon name="download" size={11} aria-hidden="true" />CSV</span>
              </button>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 flex-1 px-2.5 py-1.5 rounded-lg bg-accent/50 border border-border/50">
                <SvgIcon name="search" size={12} className="text-muted-foreground" aria-hidden="true" />
                <input value={messageQuery} onChange={e => setMessageQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent outline-none text-xs text-foreground placeholder:text-muted-foreground" placeholder="Cari nama, email, atau pesan..." aria-label="Cari pesan masuk" />
              </div>
              <select value={sortNewest ? "newest" : "oldest"} onChange={e => setSortNewest(e.target.value === "newest")} className="px-2 rounded-lg bg-accent text-xs text-accent-foreground outline-none" aria-label="Urutkan pesan">
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
              </select>
            </div>
          </div>
        )}

        {filteredMsgs.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex justify-center mb-2 text-blue-400">{messages.length === 0 ? <SvgIcon name="inbox" size={30} /> : <SvgIcon name="check-circle" size={30} />}</div>
            <p className="text-xs text-muted-foreground">{messages.length === 0 ? "Belum ada pesan masuk" : "Semua pesan sudah dibaca"}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence>
              {filteredMsgs.map(msg => (
                <motion.div key={msg.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                  className="rounded-xl overflow-hidden cursor-pointer"
                  style={{ background: msg.read ? "hsl(var(--accent)/0.4)" : "linear-gradient(135deg, rgba(59,130,246,0.07), rgba(99,102,241,0.07))", border: `1px solid ${msg.read ? "hsl(var(--border))" : "rgba(99,102,241,0.3)"}` }}
                  onClick={() => { if (!msg.read) markRead(msg.id); setExpandedId(expandedId === msg.id ? null : msg.id); }}
                  data-testid={`message-${msg.id}`}
                >
                  <div className="p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          {!msg.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                          <span className="text-xs font-bold text-foreground">{msg.name}</span>
                          <span className="text-[10px] text-muted-foreground">·</span>
                          <span className="text-[10px] text-muted-foreground truncate">{msg.email}</span>
                        </div>
                        <p className={`text-[11px] text-muted-foreground mt-0.5 ${expandedId === msg.id ? "" : "line-clamp-2"}`}>{msg.message}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-1">{new Date(msg.timestamp).toLocaleString("id-ID")}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <a href={`mailto:${msg.email}?subject=Re: Pesan Portfolio`} onClick={e => e.stopPropagation()}
                          className="p-1.5 rounded-lg hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-colors" title="Balas email">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        </a>
                        <button onClick={e => { e.stopPropagation(); deleteMsg(msg.id); }}
                          disabled={deletingId === msg.id}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors" title="Hapus"
                          data-testid={`delete-message-${msg.id}`}>
                          {deletingId === msg.id ? (
                            <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }} className="block w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Card>

      {/* Language stats */}
      {langStats.length > 0 && (
        <Card title={<IconText icon="code">Statistik Kode</IconText>} subtitle="Distribusi bahasa sumber kode">
          <div className="space-y-2.5">
            {langStats.map(s => (
              <div key={s.language} className="flex items-center gap-2.5">
                <span className="text-[10px] font-mono font-bold w-16 flex-shrink-0" style={{ color: s.color }}>{s.language}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-accent">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${s.percentage}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full" style={{ background: s.color }} />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{s.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Home Tab ───────────────────────────────────────────────────────────────────
function HomeTab({ draft, setDraft, onSave, onCancel }: any) {
  const [trLoading, setTrLoading] = useState<Record<string, boolean>>({});

  const translate = async (field: string, text: string) => {
    if (!text.trim()) return;
    setTrLoading(l => ({ ...l, [field]: true }));
    const result = await autoTranslate(text);
    setTrLoading(l => ({ ...l, [field]: false }));
    if (!result) return;
    if (field === "statusTexts") setDraft((d: PortfolioSettings) => ({ ...d, statusTexts: { ...d.statusTexts, en: result.split(/[,\n]/).map((s: string) => s.trim()).filter(Boolean) } }));
  };

  return (
    <Card title={<IconText icon="home">Pengaturan Beranda</IconText>}>
      <div className="space-y-4">
        <Field label="URL Foto Profil">
          <input value={draft.photoUrl || ""} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, photoUrl: e.target.value }))} className={inputCls} data-testid="admin-photo-url" placeholder="https://..." />
          {draft.photoUrl && (
            <div className="flex items-center gap-2.5 mt-2 p-3 rounded-xl bg-accent/40">
              <img src={draft.photoUrl} alt="preview" className="w-10 h-10 rounded-full object-cover object-top border border-border" />
              <span className="text-xs text-muted-foreground">Preview foto profil</span>
            </div>
          )}
        </Field>

        <Field label="URL Favicon (ikon tab browser)">
          <input value={draft.faviconUrl || ""} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, faviconUrl: e.target.value }))} className={inputCls} data-testid="admin-favicon-url" placeholder="https://..." />
          {draft.faviconUrl && (
            <div className="flex items-center gap-3 mt-2 p-3 rounded-xl bg-accent/40">
              <img src={draft.faviconUrl} alt="favicon" className="w-8 h-8 rounded-lg object-cover border border-border flex-shrink-0" onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }} />
              <div>
                <p className="text-xs font-semibold text-foreground">Preview Favicon</p>
                <p className="text-[10px] text-muted-foreground">Muncul di tab browser setelah disimpan</p>
              </div>
            </div>
          )}
        </Field>

        <Field label="Nama">
          <input value={draft.name || ""} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, name: e.target.value }))} className={inputCls} data-testid="admin-name" />
        </Field>

        <div className="p-3.5 rounded-xl bg-accent/30 border border-border/50 space-y-3">
          <p className="text-xs text-muted-foreground font-semibold inline-flex items-center gap-2"><SvgIcon name="lightbulb" size={14} aria-hidden="true" />Ketik teks ID, klik ID→EN untuk terjemahkan otomatis</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Status Teks" hint="ID" row={<TranslateBtn loading={!!trLoading.statusTexts} onClick={() => translate("statusTexts", draft.statusTexts?.id?.join(", ") || "")} />}>
              <textarea rows={3} value={draft.statusTexts?.id?.join("\n") || ""} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, statusTexts: { ...d.statusTexts, id: e.target.value.split("\n").map((s: string) => s.trim()).filter(Boolean) } }))} className={inputCls + " resize-none"} placeholder="Satu per baris..." />
            </Field>
            <Field label="Status Teks" hint="EN (auto)">
              <textarea rows={3} value={draft.statusTexts?.en?.join("\n") || ""} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, statusTexts: { ...d.statusTexts, en: e.target.value.split("\n").map((s: string) => s.trim()).filter(Boolean) } }))} className={inputCls + " resize-none"} placeholder="One per line..." />
            </Field>
          </div>
        </div>

        <SaveBar onSave={onSave} onCancel={onCancel} />
      </div>
    </Card>
  );
}

// ── About Tab ──────────────────────────────────────────────────────────────────
function AboutTab({ draft, setDraft, onSave, onCancel }: any) {
  const [trLoading, setTrLoading] = useState<Record<string, boolean>>({});

  const translate = async (field: string, text: string) => {
    if (!text.trim()) return;
    setTrLoading(l => ({ ...l, [field]: true }));
    const result = await autoTranslate(text);
    setTrLoading(l => ({ ...l, [field]: false }));
    if (!result) return;
    if (field === "aboutDesc") setDraft((d: PortfolioSettings) => ({ ...d, aboutDesc: { ...d.aboutDesc, en: result } }));
    if (field === "origin") setDraft((d: PortfolioSettings) => ({ ...d, originEn: result }));
  };

  return (
    <Card title={<IconText icon="user">Pengaturan Tentang</IconText>}>
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Tanggal Lahir">
            <input type="date" value={draft.birthDate || ""} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, birthDate: e.target.value }))} className={inputCls} />
            {draft.birthDate && <p className="text-[11px] text-muted-foreground mt-1">Umur: <span className="font-bold text-foreground">{calculateAge(draft.birthDate)} tahun</span></p>}
          </Field>
          <Field label="Asal" row={<TranslateBtn loading={!!trLoading.origin} onClick={() => translate("origin", draft.origin || "")} />}>
            <input value={draft.origin || ""} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, origin: e.target.value }))} className={inputCls} />
          </Field>
        </div>

        <Field label="Sekolah">
          <input value={draft.school || ""} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, school: e.target.value }))} className={inputCls} />
        </Field>

        <div className="p-3.5 rounded-xl bg-accent/30 border border-border/50 space-y-3">
          <p className="text-xs text-muted-foreground font-semibold inline-flex items-center gap-2"><SvgIcon name="lightbulb" size={14} aria-hidden="true" />Klik ID→EN untuk terjemahkan deskripsi otomatis</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Deskripsi" hint="ID" row={<TranslateBtn loading={!!trLoading.aboutDesc} onClick={() => translate("aboutDesc", draft.aboutDesc?.id || "")} />}>
              <textarea rows={4} value={draft.aboutDesc?.id || ""} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, aboutDesc: { ...d.aboutDesc, id: e.target.value } }))} className={inputCls + " resize-none"} />
            </Field>
            <Field label="Deskripsi" hint="EN (auto)">
              <textarea rows={4} value={draft.aboutDesc?.en || ""} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, aboutDesc: { ...d.aboutDesc, en: e.target.value } }))} className={inputCls + " resize-none"} />
            </Field>
          </div>
        </div>

        <SaveBar onSave={onSave} onCancel={onCancel} />
      </div>
    </Card>
  );
}

// ── Tech Tab ───────────────────────────────────────────────────────────────────
const CAT_META = {
  programming: { label: "Programming", icon: "code" as SvgIconName, color: "#3b82f6" },
  framework:   { label: "Framework & Library", icon: "zap" as SvgIconName, color: "#6366f1" },
  tools:       { label: "Tools & Platform", icon: "wrench" as SvgIconName, color: "#10b981" }
} as const;

function TechTab({ draft, setDraft, onSave, onCancel }: any) {
  const { toast } = useToast();
  const [addName, setAddName] = useState("");
  const [addCat, setAddCat] = useState<"programming" | "framework" | "tools">("tools");
  const [search, setSearch] = useState("");

  const addTech = () => {
    const name = addName.trim().toLowerCase().replace(/\s+/g, "");
    if (!name) return;
    const existing = (draft.techStack[addCat] as string[]);
    if (existing.includes(name)) {
      toast({ title: "Sudah ada", description: `"${name}" sudah di kategori ${addCat}`, variant: "destructive" });
      return;
    }
    setDraft((d: PortfolioSettings) => ({ ...d, techStack: { ...d.techStack, [addCat]: [...existing, name] } }));
    setAddName("");
    toast({ title: `Ditambahkan ke ${addCat}`, description: `"${name}"` });
  };

  const removeTech = (cat: string, name: string) => {
    setDraft((d: PortfolioSettings) => ({ ...d, techStack: { ...d.techStack, [cat]: (d.techStack[cat as keyof typeof d.techStack] as string[]).filter(n => n !== name) } }));
  };

  const moveTech = (cat: string, name: string, dir: -1 | 1) => {
    setDraft((d: PortfolioSettings) => {
      const arr = [...(d.techStack[cat as keyof typeof d.techStack] as string[])];
      const idx = arr.indexOf(name);
      if (idx < 0) return d;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= arr.length) return d;
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return { ...d, techStack: { ...d.techStack, [cat]: arr } };
    });
  };

  const totalCount = Object.values(draft.techStack).flat().length;

  return (
    <div className="space-y-4">
      <Card title={<IconText icon="plus">Tambah Teknologi</IconText>} subtitle="Nama sesuai library tech-stack-icons">
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(CAT_META) as [string, { label: string; icon: SvgIconName; color: string }][]).map(([key, meta]) => (
              <button key={key} onClick={() => setAddCat(key as any)}
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
                style={{ background: addCat === key ? `${meta.color}18` : "hsl(var(--accent)/0.5)", border: `1.5px solid ${addCat === key ? meta.color : "transparent"}`, color: addCat === key ? meta.color : "hsl(var(--muted-foreground))" }}
                data-testid={`cat-select-${key}`}>
                <SvgIcon name={meta.icon} size={18} aria-hidden="true" />
                <span className="text-[10px]">{key}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "hsl(var(--accent)/0.4)", border: "1px solid hsl(var(--border)/0.6)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
              {addName.trim() ? <StackIcon name={addName.trim().toLowerCase()} variant="dark" className="w-5 h-5" /> : <SvgIcon name="code" size={18} className="opacity-30" aria-hidden="true" />}
            </div>
            <input
              dir="ltr"
              value={addName}
              onChange={e => setAddName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTech(); } }}
              placeholder="Ketik nama ikon (Enter = tambah)..."
              data-testid="tech-add-input"
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground/50"
              autoComplete="off" autoCorrect="off" spellCheck={false}
            />
            {addName && <button onClick={() => setAddName("")} className="text-muted-foreground/60 hover:text-foreground text-xs flex-shrink-0" aria-label="Kosongkan nama teknologi"><SvgIcon name="x" size={14} /></button>}
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={addTech}
            disabled={!addName.trim()}
            data-testid="tech-add-btn"
            className="w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
            style={{
              background: addName.trim() ? `linear-gradient(135deg, ${CAT_META[addCat].color}, ${addCat === "programming" ? "#6366f1" : addCat === "framework" ? "#8b5cf6" : "#0d9488"})` : "hsl(var(--muted))",
              color: addName.trim() ? "white" : "hsl(var(--muted-foreground))"
            }}>
            <span>+ Tambah ke {addCat}</span>
          </motion.button>
        </div>
      </Card>

      {/* Search */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}>
        <SvgIcon name="search" size={14} className="text-muted-foreground flex-shrink-0" aria-hidden="true" />
        <input dir="ltr" value={search} onChange={e => setSearch(e.target.value)} placeholder={`Cari dari ${totalCount} teknologi...`} className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground/50" data-testid="tech-search-input" />
        {search && <button onClick={() => setSearch("")} className="text-muted-foreground/60 hover:text-foreground text-xs" aria-label="Hapus pencarian"><SvgIcon name="x" size={14} /></button>}
      </div>

      {/* Tech lists */}
      {(["programming", "framework", "tools"] as const).map(cat => {
        const all = draft.techStack[cat] as string[];
        const items = all.filter((n: string) => !search || n.toLowerCase().includes(search.toLowerCase()));
        const meta = CAT_META[cat];
        return (
          <Card key={cat} title={<IconText icon={meta.icon}>{meta.label}</IconText>} subtitle={`${all.length} item${items.length !== all.length ? ` · ${items.length} cocok` : ""}`}>
            {items.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">{search ? "Tidak ada yang cocok" : "Belum ada teknologi"}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {items.map((name: string) => (
                  <motion.div key={name} layout initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                    className="group flex items-center gap-2 px-2.5 py-2 rounded-xl"
                    style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
                    data-testid={`tech-item-${cat}-${name}`}>
                    <StackIcon name={name} variant="dark" className="w-4 h-4 flex-shrink-0" />
                    <span className="text-[11px] font-mono text-foreground/80">{name}</span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => moveTech(cat, name, -1)} className="p-0.5 rounded text-muted-foreground hover:text-foreground" title="Kiri" data-testid={`tech-move-left-${name}`}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
                      </button>
                      <button onClick={() => moveTech(cat, name, 1)} className="p-0.5 rounded text-muted-foreground hover:text-foreground" title="Kanan" data-testid={`tech-move-right-${name}`}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
                      </button>
                      <button onClick={() => removeTech(cat, name)} className="p-0.5 rounded text-red-400/50 hover:text-red-400" title="Hapus" data-testid={`tech-remove-${name}`}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
      <SaveBar onSave={onSave} onCancel={onCancel} />
    </div>
  );
}

// ── Projects Tab ───────────────────────────────────────────────────────────────
function ProjectsTab({ draft, setDraft, onSave, onCancel }: any) {
  const [editing, setEditing] = useState<string | null>(null);
  const [newP, setNewP] = useState({ name: "", image: "", descId: "", descEn: "", url: "", buttonType: "view" });
  const [trLoading, setTrLoading] = useState<Record<string, boolean>>({});

  const translateDesc = async (projectId: string, text: string) => {
    if (!text.trim()) return;
    setTrLoading(l => ({ ...l, [projectId]: true }));
    const result = await autoTranslate(text);
    setTrLoading(l => ({ ...l, [projectId]: false }));
    if (!result) return;
    setDraft((d: PortfolioSettings) => ({ ...d, projects: d.projects.map((p: ProjectItem) => p.id === projectId ? { ...p, desc: { ...p.desc, en: result } } : p) }));
  };

  const moveProject = (id: string, dir: -1 | 1) => {
    setDraft((d: PortfolioSettings) => {
      const arr = [...d.projects];
      const idx = arr.findIndex((p: ProjectItem) => p.id === id);
      if (idx < 0) return d;
      const ni = idx + dir;
      if (ni < 0 || ni >= arr.length) return d;
      [arr[idx], arr[ni]] = [arr[ni], arr[idx]];
      return { ...d, projects: arr };
    });
  };

  const addProject = () => {
    if (!newP.name.trim()) return;
    setDraft((d: PortfolioSettings) => ({ ...d, projects: [...d.projects, { id: Date.now().toString(), name: newP.name, image: newP.image, desc: { id: newP.descId, en: newP.descEn }, url: newP.url, buttonType: newP.buttonType }] }));
    setNewP({ name: "", image: "", descId: "", descEn: "", url: "", buttonType: "view" });
  };

  return (
    <div className="space-y-3">
      {draft.projects.map((project: ProjectItem, idx: number) => (
        <div key={project.id} className="rounded-2xl overflow-hidden" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}>
          <div className="px-4 py-3.5 flex items-center justify-between border-b border-border/40">
            <div className="flex items-center gap-2.5">
              {project.image && <img src={project.image} alt="" className="w-8 h-8 rounded-lg object-cover object-top border border-border flex-shrink-0" />}
              <span className="text-sm font-semibold text-foreground">{idx + 1}. {project.name}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => moveProject(project.id, -1)} disabled={idx === 0} className="p-1.5 rounded-lg bg-accent text-accent-foreground disabled:opacity-30 transition-all" title="Naik">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg>
              </button>
              <button onClick={() => moveProject(project.id, 1)} disabled={idx === draft.projects.length - 1} className="p-1.5 rounded-lg bg-accent text-accent-foreground disabled:opacity-30 transition-all" title="Turun">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <button onClick={() => setEditing(editing === project.id ? null : project.id)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-accent text-accent-foreground">
                {editing === project.id ? "Tutup" : "Edit"}
              </button>
              <button onClick={() => setDraft((d: PortfolioSettings) => ({ ...d, projects: d.projects.filter((p: ProjectItem) => p.id !== project.id) }))}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium" style={{ background: "hsl(var(--destructive)/0.1)", color: "hsl(var(--destructive))" }}>
                Hapus
              </button>
            </div>
          </div>
          <AnimatePresence>
            {editing === project.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Nama"><input value={project.name} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, projects: d.projects.map((p: ProjectItem) => p.id === project.id ? { ...p, name: e.target.value } : p) }))} className={inputCls} /></Field>
                    <Field label="URL Gambar">
                      <input value={project.image} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, projects: d.projects.map((p: ProjectItem) => p.id === project.id ? { ...p, image: e.target.value } : p) }))} className={inputCls} />
                      {project.image && <img src={project.image} alt="" className="mt-1.5 w-24 h-14 object-cover object-top rounded-lg border border-border" />}
                    </Field>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Deskripsi" hint="ID" row={<TranslateBtn loading={!!trLoading[project.id]} onClick={() => translateDesc(project.id, project.desc.id)} />}>
                      <textarea rows={2} value={project.desc.id} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, projects: d.projects.map((p: ProjectItem) => p.id === project.id ? { ...p, desc: { ...p.desc, id: e.target.value } } : p) }))} className={inputCls + " resize-none"} />
                    </Field>
                    <Field label="Deskripsi" hint="EN">
                      <textarea rows={2} value={project.desc.en} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, projects: d.projects.map((p: ProjectItem) => p.id === project.id ? { ...p, desc: { ...p.desc, en: e.target.value } } : p) }))} className={inputCls + " resize-none"} />
                    </Field>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="URL"><input value={project.url} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, projects: d.projects.map((p: ProjectItem) => p.id === project.id ? { ...p, url: e.target.value } : p) }))} className={inputCls} /></Field>
                    <Field label="Tipe Tombol">
                      <select value={project.buttonType} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, projects: d.projects.map((p: ProjectItem) => p.id === project.id ? { ...p, buttonType: e.target.value } : p) }))} className={inputCls}>
                        <option value="view">View / Lihat</option>
                        <option value="group">Join Group</option>
                      </select>
                    </Field>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      <Card title="＋ Tambah Proyek Baru">
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Nama"><input value={newP.name} onChange={e => setNewP(n => ({ ...n, name: e.target.value }))} className={inputCls} placeholder="Nama proyek..." /></Field>
            <Field label="URL Gambar"><input value={newP.image} onChange={e => setNewP(n => ({ ...n, image: e.target.value }))} className={inputCls} placeholder="https://..." /></Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Deskripsi" hint="ID" row={<TranslateBtn loading={!!trLoading["new"]} onClick={async () => { setTrLoading(l => ({ ...l, new: true })); const r = await autoTranslate(newP.descId); setTrLoading(l => ({ ...l, new: false })); if (r) setNewP(n => ({ ...n, descEn: r })); }} />}>
              <textarea rows={2} value={newP.descId} onChange={e => setNewP(n => ({ ...n, descId: e.target.value }))} className={inputCls + " resize-none"} />
            </Field>
            <Field label="Deskripsi" hint="EN"><textarea rows={2} value={newP.descEn} onChange={e => setNewP(n => ({ ...n, descEn: e.target.value }))} className={inputCls + " resize-none"} /></Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="URL"><input value={newP.url} onChange={e => setNewP(n => ({ ...n, url: e.target.value }))} className={inputCls} /></Field>
            <Field label="Tipe">
              <select value={newP.buttonType} onChange={e => setNewP(n => ({ ...n, buttonType: e.target.value }))} className={inputCls}>
                <option value="view">View</option>
                <option value="group">Join Group</option>
              </select>
            </Field>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={addProject} disabled={!newP.name.trim()}
            className="px-5 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white" }}>
            + Tambah Proyek
          </motion.button>
        </div>
      </Card>
      <SaveBar onSave={onSave} onCancel={onCancel} />
    </div>
  );
}

// ── Friends Tab ────────────────────────────────────────────────────────────────
function FriendsTab({ draft, setDraft, onSave, onCancel }: any) {
  const [newFriend, setNewFriend] = useState("");

  const addFriend = () => {
    const name = newFriend.trim();
    if (!name || draft.friends.includes(name)) return;
    setDraft((d: PortfolioSettings) => ({ ...d, friends: [...d.friends, name] }));
    setNewFriend("");
  };

  const removeFriend = (name: string) => {
    setDraft((d: PortfolioSettings) => ({ ...d, friends: d.friends.filter((f: string) => f !== name) }));
  };

  return (
    <Card title={<IconText icon="users">Daftar Teman</IconText>} subtitle={`${draft.friends.length} teman terdaftar`}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <input value={newFriend} onChange={e => setNewFriend(e.target.value)} onKeyDown={e => e.key === "Enter" && addFriend()}
            placeholder="Tambah nama teman..." className={inputCls + " flex-1"} data-testid="friend-input" />
          <motion.button whileTap={{ scale: 0.95 }} onClick={addFriend} disabled={!newFriend.trim()}
            className="px-4 py-2.5 rounded-xl text-sm font-bold flex-shrink-0 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white" }}>
            +
          </motion.button>
        </div>

        {draft.friends.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {draft.friends.map((f: string, i: number) => (
                <motion.div key={f} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: "hsl(var(--accent))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}>
                  <span>{f}</span>
                  <button onClick={() => removeFriend(f)} className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-colors text-muted-foreground" data-testid={`remove-friend-${i}`}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-muted-foreground">Belum ada teman. Tambahkan di atas.</div>
        )}

        <SaveBar onSave={onSave} onCancel={onCancel} />
      </div>
    </Card>
  );
}

// ── Social Tab ─────────────────────────────────────────────────────────────────
const SOCIALS: { key: string; label: string; icon: SvgIconName; ph: string }[] = [
  { key: "github", label: "GitHub", icon: "github", ph: "https://github.com/..." },
  { key: "instagram", label: "Instagram", icon: "instagram", ph: "https://instagram.com/..." },
  { key: "facebook", label: "Facebook", icon: "link", ph: "https://facebook.com/..." },
  { key: "youtube", label: "YouTube", icon: "youtube", ph: "https://youtube.com/@..." },
  { key: "telegram", label: "Telegram", icon: "send", ph: "https://t.me/..." },
  { key: "discord", label: "Discord", icon: "message", ph: "https://discord.gg/..." },
  { key: "email", label: "Email", icon: "mail", ph: "nama@email.com" },
];

function SocialTab({ draft, setDraft, onSave, onCancel }: any) {
  return (
    <Card title={<IconText icon="link">Media Sosial</IconText>}>
      <div className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          {SOCIALS.map(s => (
            <Field key={s.key} label={s.label} row={<SvgIcon name={s.icon} size={14} aria-hidden="true" />}>
              <input value={draft.social?.[s.key] || ""} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, social: { ...d.social, [s.key]: e.target.value } }))} placeholder={s.ph} className={inputCls} />
            </Field>
          ))}
        </div>
        <SaveBar onSave={onSave} onCancel={onCancel} />
      </div>
    </Card>
  );
}

// ── Audio Tab ──────────────────────────────────────────────────────────────────
function AudioTab({ draft, setDraft, onSave, onCancel }: any) {
  const addTrack = () => {
    setDraft((d: PortfolioSettings) => ({ ...d, playlist: [...d.playlist, { id: Date.now().toString(), title: "Lagu Baru", url: "" }] }));
  };

  const updateTrack = (id: string, field: string, value: string) => {
    setDraft((d: PortfolioSettings) => ({ ...d, playlist: d.playlist.map((t: PlaylistItem) => t.id === id ? { ...t, [field]: value } : t) }));
  };

  const moveTrack = (id: string, dir: -1 | 1) => {
    setDraft((d: PortfolioSettings) => {
      const arr = [...d.playlist];
      const idx = arr.findIndex((t: PlaylistItem) => t.id === id);
      if (idx < 0) return d;
      const ni = idx + dir;
      if (ni < 0 || ni >= arr.length) return d;
      [arr[idx], arr[ni]] = [arr[ni], arr[idx]];
      return { ...d, playlist: arr };
    });
  };

  return (
    <div className="space-y-4">
      {draft.playlist.map((track: PlaylistItem, i: number) => (
        <Card key={track.id} title={<IconText icon="music">Lagu {i + 1}</IconText>}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                <button onClick={() => moveTrack(track.id, -1)} disabled={i === 0} className="p-1.5 rounded-lg bg-accent text-accent-foreground disabled:opacity-30 transition-all" title="Naik">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg>
                </button>
                <button onClick={() => moveTrack(track.id, 1)} disabled={i === draft.playlist.length - 1} className="p-1.5 rounded-lg bg-accent text-accent-foreground disabled:opacity-30 transition-all" title="Turun">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                </button>
              </div>
              <button onClick={() => setDraft((d: PortfolioSettings) => ({ ...d, playlist: d.playlist.filter((t: PlaylistItem) => t.id !== track.id) }))}
                className="px-2.5 py-1 rounded-lg text-xs" style={{ background: "hsl(var(--destructive)/0.1)", color: "hsl(var(--destructive))" }}>Hapus</button>
            </div>
            <Field label="Judul Lagu">
              <input value={track.title} onChange={e => updateTrack(track.id, "title", e.target.value)} className={inputCls} />
            </Field>
            <Field label="URL MP3">
              <input value={track.url} onChange={e => updateTrack(track.id, "url", e.target.value)} placeholder="https://...mp3" className={inputCls} />
            </Field>
            {track.url && (
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Preview</p>
                <audio controls src={track.url} className="w-full" style={{ height: 36, borderRadius: 8 }} />
              </div>
            )}
          </div>
        </Card>
      ))}

      <motion.button whileTap={{ scale: 0.95 }} onClick={addTrack}
        className="w-full py-3 rounded-2xl text-sm font-semibold border-2 border-dashed border-border text-muted-foreground hover:border-blue-500/40 hover:text-blue-400 transition-all">
        + Tambah Lagu
      </motion.button>

      <SaveBar onSave={onSave} onCancel={onCancel} />
    </div>
  );
}

// ── Settings Tab ───────────────────────────────────────────────────────────────
function SettingsTab({ draft, setDraft, onSave, onCancel, onReset, onLogout }: any) {
  const { toast } = useToast();
  const [clock, setClock] = useState(new Date());
  const [confirmReset, setConfirmReset] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Password strength
  const getStrength = (pw: string): { score: number; label: string; color: string } => {
    if (!pw) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score, label: "Lemah", color: "#ef4444" };
    if (score <= 3) return { score, label: "Sedang", color: "#f59e0b" };
    return { score, label: "Kuat", color: "#22c55e" };
  };
  const strength = getStrength(newPw);

  const changePw = async () => {
    if (!newPw.trim() || newPw.length < 10) return toast({ title: "Password minimal 10 karakter", variant: "destructive" });
    if (newPw !== confirmPw) return toast({ title: "Password tidak cocok", variant: "destructive" });
    setPwLoading(true);
    try {
      const res = await fetch("/api/admin/change-password", { method: "POST", headers: adminHeaders(), body: JSON.stringify({ newPassword: newPw }) });
      const data = await res.json();
      if (data.ok) {
        toast({ title: "Password berhasil diubah", description: "Logout otomatis. Login ulang dengan password baru." });
        setNewPw(""); setConfirmPw("");
        setTimeout(() => { sessionStorage.removeItem("aka-admin-token"); onLogout(); }, 1500);
      } else {
        toast({ title: data.error || "Gagal", variant: "destructive" });
      }
    } catch { toast({ title: "Koneksi gagal", variant: "destructive" }); }
    setPwLoading(false);
  };

  const handleReset = () => {
    if (!confirmReset) { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 3000); return; }
    onReset(); setConfirmReset(false);
    toast({ title: "Reset berhasil", description: "Semua pengaturan dikembalikan ke default" });
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "aka-settings.json"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Diekspor" });
  };

  const importSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        setDraft((d: any) => ({ ...d, ...parsed }));
        toast({ title: "Diimpor", description: "Review lalu simpan perubahan" });
      } catch { toast({ title: "File tidak valid", variant: "destructive" }); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const testEmail = async () => {
    setTestEmailLoading(true);
    setTestEmailResult(null);
    try {
      const res = await fetch("/api/admin/test-email", { method: "POST", headers: adminHeaders() });
      const data = await res.json();
      setTestEmailResult({ ok: data.ok, msg: data.ok ? `Berhasil dikirim ke ${data.to}` : (data.error || "Gagal") });
    } catch { setTestEmailResult({ ok: false, msg: "Koneksi gagal" }); }
    setTestEmailLoading(false);
  };

  const sectionLabels: Record<string, React.ReactNode> = {
    about: <IconText icon="user">Tentang</IconText>, timeline: <IconText icon="calendar">Pendidikan</IconText>, stack: <IconText icon="code">Tech Stack</IconText>,
    projects: <IconText icon="briefcase">Proyek</IconText>, friends: <IconText icon="users">Teman</IconText>, social: <IconText icon="link">Sosial Media</IconText>, contact: <IconText icon="mail">Kontak</IconText>
  };

  return (
    <div className="space-y-4">
      {/* Info card */}
      <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}>
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Waktu Server</p>
          <p className="text-2xl font-bold text-foreground tabular-nums">{clock.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
          <p className="text-[11px] text-muted-foreground">{clock.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <a href="/" target="_blank" rel="noopener" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-accent-foreground hover:bg-accent/80 transition-all">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Lihat Situs
          </a>
          <button onClick={() => { navigator.clipboard?.writeText(window.location.origin).then(() => toast({ title: "URL disalin" })); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-accent-foreground hover:bg-accent/80 transition-all">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Salin URL
          </button>
        </div>
      </div>

      {/* Section visibility */}
      <Card title={<IconText icon="eye">Visibilitas Seksi</IconText>} subtitle="Tampilkan/sembunyikan seksi di portfolio">
        <div className="space-y-2">
          {Object.entries(sectionLabels).map(([key, label]) => {
            const isVisible = draft.sectionVisibility?.[key] !== false;
            return (
              <div key={key} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                <span className="text-sm text-foreground">{label}</span>
                <motion.button whileTap={{ scale: 0.92 }} data-testid={`visibility-${key}`}
                  onClick={() => setDraft((d: any) => ({ ...d, sectionVisibility: { ...d.sectionVisibility, [key]: !isVisible } }))}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{ background: isVisible ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)", color: isVisible ? "#22c55e" : "#ef4444", border: `1px solid ${isVisible ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}` }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: isVisible ? "#22c55e" : "#ef4444" }} />
                  {isVisible ? "Tampil" : "Sembunyikan"}
                </motion.button>
              </div>
            );
          })}
        </div>
        <SaveBar onSave={onSave} onCancel={onCancel} />
      </Card>

      {/* Education timeline */}
      <Card title={<IconText icon="school">Editor Pendidikan</IconText>} subtitle="Edit nama sekolah dan tahun">
        <div className="space-y-3">
          {([{ key: "sd", label: "SD" }, { key: "mts", label: "MTs / SMP" }, { key: "sma", label: "SMA / SMK" }] as const).map(({ key, label }) => (
            <div key={key} className="p-3 rounded-xl bg-accent/30 border border-border/50 space-y-2">
              <p className="text-xs font-bold text-foreground/70 flex items-center gap-2"><SchoolLogo level={key} alt={label} className="w-8 h-8 rounded-lg bg-white p-0.5" />{label}</p>
              <div className="grid sm:grid-cols-2 gap-2">
                <Field label="Nama Sekolah">
                  <input value={draft.timeline?.[key]?.name || ""} onChange={e => setDraft((d: any) => ({ ...d, timeline: { ...d.timeline, [key]: { ...d.timeline?.[key], name: e.target.value } } }))} className={inputCls} />
                </Field>
                <Field label="Tahun">
                  <input value={draft.timeline?.[key]?.year || ""} onChange={e => setDraft((d: any) => ({ ...d, timeline: { ...d.timeline, [key]: { ...d.timeline?.[key], year: e.target.value } } }))} className={inputCls} placeholder="2020 - 2023" />
                </Field>
              </div>
            </div>
          ))}
        </div>
        <SaveBar onSave={onSave} onCancel={onCancel} />
      </Card>

      {/* SEO */}
      <Card title={<IconText icon="search">SEO & Meta</IconText>} subtitle="Optimalkan snippet pencarian dan social preview">
        <div className="space-y-3">
          <Field label="Judul Halaman" hint={`${(draft.seo?.title || "").length}/60`}>
            <input maxLength={60} value={draft.seo?.title || ""} onChange={e => setDraft((d: any) => ({ ...d, seo: { ...d.seo, title: e.target.value } }))} className={inputCls} placeholder="aka — Portfolio" />
          </Field>
          <Field label="Deskripsi Meta" hint={`${(draft.seo?.description || "").length}/160`}>
            <textarea maxLength={160} rows={2} value={draft.seo?.description || ""} onChange={e => setDraft((d: any) => ({ ...d, seo: { ...d.seo, description: e.target.value } }))} className={inputCls + " resize-none"} />
          </Field>
          <Field label="Keywords" hint="pisahkan dengan koma">
            <input value={draft.seo?.keywords || ""} onChange={e => setDraft((d: any) => ({ ...d, seo: { ...d.seo, keywords: e.target.value } }))} className={inputCls} placeholder="portfolio, developer, Sumatera Barat" />
          </Field>
          <Field label="Canonical URL">
            <input type="url" value={draft.seo?.canonical || ""} onChange={e => setDraft((d: any) => ({ ...d, seo: { ...d.seo, canonical: e.target.value } }))} className={inputCls} placeholder="https://akadev.me/" />
          </Field>
          <Field label="Open Graph Image URL">
            <input type="url" value={draft.seo?.ogImage || ""} onChange={e => setDraft((d: any) => ({ ...d, seo: { ...d.seo, ogImage: e.target.value } }))} className={inputCls} placeholder="https://.../og-image.jpg" />
          </Field>
          <div className="rounded-xl p-4 space-y-1.5" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Preview Google</p>
            <p className="text-base text-blue-500 line-clamp-1">{draft.seo?.title || "Judul halaman"}</p>
            <p className="text-xs text-green-600 truncate">{draft.seo?.canonical || "https://akadev.me/"}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{draft.seo?.description || "Deskripsi meta akan tampil di sini."}</p>
          </div>
          <Field label="Teks Footer">
            <input value={draft.footerText || ""} onChange={e => setDraft((d: any) => ({ ...d, footerText: e.target.value }))} className={inputCls} placeholder="© 2026 Aka" />
          </Field>
        </div>
        <SaveBar onSave={onSave} onCancel={onCancel} />
      </Card>

      <Card title={<IconText icon="zap">Motion & Parallax</IconText>} subtitle="Atur efek scroll hero tanpa mengganggu reduced-motion">
        <div className="space-y-4">
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <span><span className="block text-sm font-semibold text-foreground">Aktifkan parallax hero</span><span className="block text-[11px] text-muted-foreground mt-0.5">Otomatis nonaktif jika perangkat meminta reduced motion.</span></span>
            <input type="checkbox" checked={draft.motion?.parallaxEnabled !== false} onChange={e => setDraft((d: any) => ({ ...d, motion: { ...d.motion, parallaxEnabled: e.target.checked } }))} className="h-4 w-4 accent-blue-500" />
          </label>
          <Field label="Intensitas Parallax" hint={`${Math.round((draft.motion?.parallaxIntensity ?? 0.35) * 100)}%`}>
            <input type="range" min="0" max="0.75" step="0.05" value={draft.motion?.parallaxIntensity ?? 0.35} onChange={e => setDraft((d: any) => ({ ...d, motion: { ...d.motion, parallaxIntensity: Number(e.target.value) } }))} className="w-full accent-blue-500" />
          </Field>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><SvgIcon name="info" size={14} className="text-blue-400" aria-hidden="true" />Rekomendasi 25–45% untuk menjaga depth visual tetap halus dan ringan.</div>
        </div>
        <SaveBar onSave={onSave} onCancel={onCancel} />
      </Card>

      {/* Export/Import */}
      <Card title={<IconText icon="package">Ekspor / Impor Pengaturan</IconText>} subtitle="Backup atau restore semua pengaturan">
        <div className="flex flex-wrap gap-2">
          <motion.button whileTap={{ scale: 0.95 }} onClick={exportSettings} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Ekspor JSON
          </motion.button>
          <label className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer bg-accent text-accent-foreground hover:bg-accent/80 transition-all">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Impor JSON
            <input type="file" accept=".json" onChange={importSettings} className="hidden" />
          </label>
        </div>
      </Card>

      {/* Test Email */}
      <Card title={<IconText icon="mail">Test Email</IconText>} subtitle="Verifikasi konfigurasi email (Gmail)">
        <div className="space-y-3">
          <div className="p-3 rounded-xl text-xs flex items-start gap-2" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <SvgIcon name="info" size={16} className="text-blue-400 flex-shrink-0" aria-hidden="true" />
            <span className="text-muted-foreground">Kirim email percobaan ke <strong>EMAIL_RECIPIENT</strong> untuk memastikan konfigurasi Gmail berjalan dengan benar.</span>
          </div>
          <motion.button whileTap={{ scale: 0.96 }} onClick={testEmail} disabled={testEmailLoading} data-testid="test-email-btn"
            className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "white", opacity: testEmailLoading ? 0.7 : 1 }}>
            {testEmailLoading ? (
              <><motion.span animate={{ rotate: 360 }} transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }} className="block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" /> Mengirim...</>
            ) : (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg> Kirim Test Email</>
            )}
          </motion.button>
          <AnimatePresence>
            {testEmailResult && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-3 rounded-xl text-xs flex items-center gap-2"
                style={{ background: testEmailResult.ok ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${testEmailResult.ok ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}` }}>
                <SvgIcon name={testEmailResult.ok ? "circle-check" : "circle-x"} size={16} className={testEmailResult.ok ? "text-green-500" : "text-red-500"} aria-hidden="true" />
                <span style={{ color: testEmailResult.ok ? "#22c55e" : "#ef4444" }}>{testEmailResult.msg}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Change password */}
      <Card title={<IconText icon="key">Ganti Password Admin</IconText>} subtitle="Password diverifikasi oleh server">
        <div className="space-y-3">
          <div className="p-3 rounded-xl text-xs flex items-start gap-2" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <SvgIcon name="shield" size={16} className="text-blue-400 flex-shrink-0" aria-hidden="true" />
            <span className="text-muted-foreground">Password tidak pernah disimpan di browser. Perubahan ini berlaku pada sesi server saat ini; untuk permanen, perbarui secret <code className="font-mono bg-accent px-1 py-0.5 rounded text-[10px]">ADMIN_PASSWORD</code> di Vercel.</span>
          </div>

          <Field label="Password Baru">
            <div className="relative">
              <input
                type={showNewPw ? "text" : "password"}
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                onKeyDown={e => e.key === "Enter" && changePw()}
                className={inputCls + " pr-10"}
                placeholder="Minimal 10 karakter..."
                data-testid="new-password-input"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <EyeIcon open={showNewPw} />
              </button>
            </div>
          </Field>

          {newPw && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300" style={{ background: i <= strength.score ? strength.color : "hsl(var(--accent))" }} />
                  ))}
                </div>
                {strength.label && <span className="text-[10px] font-semibold" style={{ color: strength.color }}>{strength.label}</span>}
              </div>
            </div>
          )}

          <Field label="Konfirmasi Password">
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} onKeyDown={e => e.key === "Enter" && changePw()}
              className={inputCls} placeholder="Ulangi password baru..." data-testid="confirm-password-input" autoComplete="new-password" />
          </Field>

          {newPw && confirmPw && (
            <div className="flex items-center gap-1.5 text-xs">
              <div className={`w-1.5 h-1.5 rounded-full ${newPw === confirmPw ? "bg-green-500" : "bg-red-500"}`} />
              <span className={newPw === confirmPw ? "text-green-500" : "text-red-400"}>
                {newPw === confirmPw ? "Password cocok" : "Password tidak cocok"}
              </span>
            </div>
          )}

          <motion.button whileTap={{ scale: 0.96 }} onClick={changePw} disabled={newPw.length < 10 || !confirmPw || newPw !== confirmPw || pwLoading}
            data-testid="save-password-btn"
              className="w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
            style={{
              background: newPw.length >= 10 && confirmPw && newPw === confirmPw ? "linear-gradient(135deg, #3b82f6, #6366f1)" : "hsl(var(--muted))",
              color: newPw.length >= 10 && confirmPw && newPw === confirmPw ? "white" : "hsl(var(--muted-foreground))"
            }}>
            {pwLoading ? (
              <><motion.span animate={{ rotate: 360 }} transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }} className="block w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> Menyimpan...</>
            ) : "Simpan Password Baru"}
          </motion.button>
        </div>
      </Card>

      {/* Reset */}
      <Card title={<IconText icon="reset">Reset Pengaturan</IconText>} subtitle="Kembalikan semua ke nilai default">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Semua perubahan akan hilang dan kembali ke pengaturan bawaan. Tindakan ini tidak dapat dibatalkan.</p>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleReset} data-testid="admin-reset"
            className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
            style={{ background: confirmReset ? "hsl(var(--destructive))" : "hsl(var(--destructive)/0.1)", color: confirmReset ? "white" : "hsl(var(--destructive))", border: "1px solid hsl(var(--destructive)/0.3)" }}>
            {confirmReset ? <span className="inline-flex items-center gap-1.5"><SvgIcon name="alert" size={14} aria-hidden="true" />Klik lagi untuk konfirmasi</span> : "Reset ke Default"}
          </motion.button>
        </div>
      </Card>
    </div>
  );
}

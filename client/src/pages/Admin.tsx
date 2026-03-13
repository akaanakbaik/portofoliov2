import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { usePortfolio, type PortfolioSettings, type ProjectItem, type PlaylistItem } from "@/lib/PortfolioContext";
import { useLang } from "@/lib/LangContext";
import { useToast } from "@/hooks/use-toast";
import { PORTFOLIO_CONFIG, calculateAge } from "@/lib/config";
import StackIcon from "tech-stack-icons";

const ADMIN_PASSWORD = "AKA ANAK BAIK";
const TABS = ["analytics", "home", "about", "tech", "projects", "friends", "social", "audio", "settings"] as const;
type Tab = typeof TABS[number];

interface VisitorStats {
  total: number;
  today: number;
  history: { date: string; count: number }[];
}
interface LangStat {
  language: string;
  lines: number;
  percentage: number;
  color: string;
}

const TAB_CONFIG: { key: Tab; icon: string; label: string }[] = [
  { key: "analytics", icon: "📊", label: "Analitik" },
  { key: "home", icon: "🏠", label: "Beranda" },
  { key: "about", icon: "👤", label: "Tentang" },
  { key: "tech", icon: "💻", label: "Tech Stack" },
  { key: "projects", icon: "💼", label: "Proyek" },
  { key: "friends", icon: "👥", label: "Teman" },
  { key: "social", icon: "🔗", label: "Medsos" },
  { key: "audio", icon: "🎵", label: "Audio" },
  { key: "settings", icon: "⚙️", label: "Pengaturan" },
];

async function autoTranslate(text: string): Promise<string | null> {
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result || null;
  } catch {
    return null;
  }
}

function TranslateBtn({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all flex-shrink-0"
      style={{
        background: loading ? "hsl(var(--muted))" : "rgba(59,130,246,0.12)",
        color: loading ? "hsl(var(--muted-foreground))" : "#60a5fa",
        border: "1px solid rgba(59,130,246,0.2)"
      }}
      title="Auto translate ID → EN"
    >
      {loading ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
          className="block w-3 h-3 border-2 border-current border-t-transparent rounded-full"
        />
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
  const [activeTab, setActiveTab] = useState<Tab>("analytics");
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [langStats, setLangStats] = useState<LangStat[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [draft, setDraft] = useState<PortfolioSettings>({ ...settings });
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setRefreshing(true);
    try {
      const [s, l, m] = await Promise.all([
        fetch("/api/analytics/stats").then(r => r.json()),
        fetch("/api/analytics/lang-stats").then(r => r.json()),
        fetch("/api/messages").then(r => r.json()).catch(() => [])
      ]);
      setStats(s);
      setLangStats(l);
      setMessages(Array.isArray(m) ? m : []);
    } catch {}
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("aka-admin-auth") === "true") setAuthenticated(true);
  }, []);

  useEffect(() => {
    if (authenticated) fetchAnalytics();
  }, [authenticated, fetchAnalytics]);

  useEffect(() => {
    setDraft({ ...settings });
  }, [settings, activeTab]);

  const handleLogin = () => {
    setLoginLoading(true);
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        setAuthenticated(true);
        sessionStorage.setItem("aka-admin-auth", "true");
      } else {
        setWrongPw(true);
        setTimeout(() => setWrongPw(false), 2000);
        toast({ title: "Password salah", variant: "destructive" });
      }
      setLoginLoading(false);
    }, 800);
  };

  const saveChanges = () => {
    updateSettings(draft);
    toast({ title: "Tersimpan ✓", description: "Perubahan berhasil disimpan" });
  };

  const cancelChanges = () => {
    setDraft({ ...settings });
    toast({ title: "Dibatalkan" });
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "hsl(var(--background))" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm rounded-2xl p-8"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))", boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}
        >
          <div className="text-center mb-7">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1 className="text-lg font-bold text-foreground">Admin Portal</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Masukkan password untuk melanjutkan</p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="Password rahasia..."
                data-testid="admin-password-input"
                autoComplete="off"
                className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none"
                style={{
                  background: "hsl(var(--background))",
                  border: `1.5px solid ${wrongPw ? "hsl(var(--destructive))" : "hsl(var(--border))"}`,
                  color: "hsl(var(--foreground))",
                  transition: "border-color 0.2s"
                }}
              />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {showPw ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                </svg>
              </button>
            </div>

            <AnimatePresence>
              {wrongPw && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-destructive text-center font-medium">
                  Password salah. Coba lagi.
                </motion.p>
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
                  Memeriksa...
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

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground leading-tight">Admin Dashboard</p>
                <p className="text-[10px] text-muted-foreground">Portfolio aka</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => navigate("/")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-accent-foreground hover:bg-accent/80 transition-all">
                ← Portfolio
              </button>
              <button
                onClick={() => { setAuthenticated(false); sessionStorage.removeItem("aka-admin-auth"); }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: "hsl(var(--destructive)/0.1)", color: "hsl(var(--destructive))" }}
              >
                Logout
              </button>
            </div>
          </div>

          <div className="flex gap-1 pb-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {TAB_CONFIG.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                data-testid={`admin-tab-${tab.key}`}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  background: activeTab === tab.key ? "hsl(var(--primary))" : "transparent",
                  color: activeTab === tab.key ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                  borderBottom: activeTab === tab.key ? "2px solid transparent" : "2px solid transparent"
                }}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {activeTab === "analytics" && <AnalyticsTab stats={stats} langStats={langStats} messages={messages} onRefresh={fetchAnalytics} refreshing={refreshing} />}
            {activeTab === "home" && <HomeTab draft={draft} setDraft={setDraft} onSave={saveChanges} onCancel={cancelChanges} />}
            {activeTab === "about" && <AboutTab draft={draft} setDraft={setDraft} onSave={saveChanges} onCancel={cancelChanges} />}
            {activeTab === "tech" && <TechTab draft={draft} setDraft={setDraft} onSave={saveChanges} onCancel={cancelChanges} />}
            {activeTab === "projects" && <ProjectsTab draft={draft} setDraft={setDraft} onSave={saveChanges} onCancel={cancelChanges} />}
            {activeTab === "friends" && <FriendsTab draft={draft} setDraft={setDraft} onSave={saveChanges} onCancel={cancelChanges} />}
            {activeTab === "social" && <SocialTab draft={draft} setDraft={setDraft} onSave={saveChanges} onCancel={cancelChanges} />}
            {activeTab === "audio" && <AudioTab draft={draft} setDraft={setDraft} onSave={saveChanges} onCancel={cancelChanges} />}
            {activeTab === "settings" && <SettingsTab draft={draft} setDraft={setDraft} onSave={saveChanges} onCancel={cancelChanges} onReset={resetSettings} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10";

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}>
      <div className="px-5 py-4 border-b border-border/40">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
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
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onSave}
        data-testid="admin-save"
        className="px-5 py-2.5 rounded-xl text-xs font-bold"
        style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white" }}
      >
        Simpan Perubahan
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onCancel}
        data-testid="admin-cancel"
        className="px-4 py-2.5 rounded-xl text-xs font-medium bg-secondary text-secondary-foreground"
      >
        Batal
      </motion.button>
    </div>
  );
}

function AnalyticsTab({ stats, langStats, messages, onRefresh, refreshing }: {
  stats: VisitorStats | null;
  langStats: LangStat[];
  messages: any[];
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<any[]>(messages);

  useEffect(() => { setLocalMessages(messages); }, [messages]);

  const maxVisit = stats?.history?.length ? Math.max(...stats.history.map(h => h.count), 1) : 1;
  const statCards = [
    { label: "Total Kunjungan", value: stats?.total ?? "—", icon: "👁️", color: "#3b82f6" },
    { label: "Hari Ini", value: stats?.today ?? "—", icon: "📅", color: "#10b981" },
    { label: "Hari Aktif", value: stats?.history?.filter(h => h.count > 0).length ?? "—", icon: "🗓️", color: "#f59e0b" },
    { label: "Pesan Masuk", value: localMessages.length, icon: "✉️", color: "#8b5cf6" },
  ];

  const markRead = async (id: string) => {
    setLocalMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    await fetch(`/api/messages/${id}/read`, { method: "PATCH" });
  };

  const deleteMsg = async (id: string) => {
    setDeletingId(id);
    await fetch(`/api/messages/${id}`, { method: "DELETE" });
    setLocalMessages(prev => prev.filter(m => m.id !== id));
    setDeletingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Data kunjungan & pesan masuk</p>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{ background: "hsl(var(--accent))", color: "hsl(var(--foreground))" }}
          data-testid="refresh-analytics"
        >
          <motion.span animate={refreshing ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.6, repeat: refreshing ? Infinity : 0, ease: "linear" }}>⟳</motion.span>
          {refreshing ? "Memuat..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl p-4"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
            data-testid={`stat-card-${i}`}
          >
            <div className="flex items-start justify-between mb-1.5">
              <span className="text-lg">{s.icon}</span>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 5px ${s.color}` }} />
            </div>
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {stats?.history && stats.history.length > 0 && (
        <Card title="Riwayat Kunjungan" subtitle="7 hari terakhir">
          <div className="space-y-2.5">
            {stats.history.slice(-7).reverse().map(h => (
              <div key={h.date} className="flex items-center gap-2.5">
                <span className="text-[10px] text-muted-foreground font-mono w-20 flex-shrink-0">{h.date}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-accent">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(h.count / maxVisit) * 100}%` }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(to right, #3b82f6, #6366f1)" }}
                  />
                </div>
                <span className="text-xs font-bold text-foreground w-5 text-right">{h.count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="📬 Pesan Masuk" subtitle={`${localMessages.filter(m => !m.read).length} belum dibaca`}>
        {localMessages.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-xs text-muted-foreground">Belum ada pesan masuk</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {localMessages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl p-3.5 cursor-pointer"
                style={{
                  background: msg.read ? "hsl(var(--accent)/0.4)" : "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.08))",
                  border: `1px solid ${msg.read ? "hsl(var(--border))" : "rgba(99,102,241,0.3)"}`
                }}
                onClick={() => !msg.read && markRead(msg.id)}
                data-testid={`message-${msg.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {!msg.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                      <span className="text-xs font-bold text-foreground truncate">{msg.name}</span>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">·</span>
                      <span className="text-[10px] text-muted-foreground truncate">{msg.email}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{msg.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(msg.timestamp).toLocaleString("id-ID")}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteMsg(msg.id); }}
                    disabled={deletingId === msg.id}
                    className="p-1 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0"
                    data-testid={`delete-message-${msg.id}`}
                  >
                    🗑️
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {langStats.length > 0 && (
        <Card title="Statistik Bahasa" subtitle="Analisis sumber kode">
          <div className="space-y-2.5">
            {langStats.map(s => (
              <div key={s.language} className="flex items-center gap-2.5">
                <span className="text-[10px] font-mono font-bold w-16 flex-shrink-0" style={{ color: s.color }}>{s.language}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-accent">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.percentage}%` }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full"
                    style={{ background: s.color }}
                  />
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

function HomeTab({ draft, setDraft, onSave, onCancel }: any) {
  const [trLoading, setTrLoading] = useState<Record<string, boolean>>({});

  const translate = async (field: string, text: string) => {
    if (!text.trim()) return;
    setTrLoading(l => ({ ...l, [field]: true }));
    const result = await autoTranslate(text);
    setTrLoading(l => ({ ...l, [field]: false }));
    if (!result) return;
    if (field === "statusTexts") {
      setDraft((d: PortfolioSettings) => ({ ...d, statusTexts: { ...d.statusTexts, en: result.split(/[,\n]/).map((s: string) => s.trim()).filter(Boolean) } }));
    }
  };

  return (
    <Card title="🏠 Pengaturan Beranda">
      <div className="space-y-4">
        <Field label="URL Foto Profil">
          <input value={draft.photoUrl} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, photoUrl: e.target.value }))} className={inputCls} data-testid="admin-photo-url" placeholder="https://..." />
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
              <img src={draft.faviconUrl} alt="favicon preview" className="w-8 h-8 rounded-lg object-cover border border-border flex-shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <div>
                <p className="text-xs font-semibold text-foreground">Favicon Preview</p>
                <p className="text-[10px] text-muted-foreground">Akan muncul di tab browser setelah simpan</p>
              </div>
            </div>
          )}
        </Field>

        <Field label="Nama">
          <input value={draft.name} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, name: e.target.value }))} className={inputCls} data-testid="admin-name" />
        </Field>

        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-accent/30 border border-border/50">
            <p className="text-xs text-muted-foreground mb-3 font-semibold">
              💡 Ketik status teks bahasa Indonesia, klik ID→EN untuk terjemahkan otomatis
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Status Teks" hint="ID" row={
                <TranslateBtn loading={!!trLoading.statusTexts} onClick={() => translate("statusTexts", draft.statusTexts.id.join(", "))} />
              }>
                <textarea rows={3} value={draft.statusTexts.id.join("\n")} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, statusTexts: { ...d.statusTexts, id: e.target.value.split("\n").map((s: string) => s.trim()).filter(Boolean) } }))} className={inputCls + " resize-none"} placeholder="Satu per baris..." />
              </Field>
              <Field label="Status Teks" hint="EN (auto)">
                <textarea rows={3} value={draft.statusTexts.en.join("\n")} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, statusTexts: { ...d.statusTexts, en: e.target.value.split("\n").map((s: string) => s.trim()).filter(Boolean) } }))} className={inputCls + " resize-none"} placeholder="One per line..." />
              </Field>
            </div>
          </div>
        </div>

        <SaveBar onSave={onSave} onCancel={onCancel} />
      </div>
    </Card>
  );
}

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
    <Card title="👤 Pengaturan Tentang">
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Tanggal Lahir">
            <input type="date" value={draft.birthDate} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, birthDate: e.target.value }))} className={inputCls} />
            <p className="text-[11px] text-muted-foreground mt-1">Umur: <span className="font-bold text-foreground">{calculateAge(draft.birthDate)} tahun</span></p>
          </Field>
          <Field label="Asal">
            <input value={draft.origin} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, origin: e.target.value }))} className={inputCls} />
          </Field>
        </div>

        <Field label="Sekolah">
          <input value={draft.school} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, school: e.target.value }))} className={inputCls} />
        </Field>

        <div className="p-3.5 rounded-xl bg-accent/30 border border-border/50 space-y-3">
          <p className="text-xs text-muted-foreground font-semibold">💡 Klik ID→EN untuk terjemahkan deskripsi otomatis</p>
          <Field label="Deskripsi" hint="ID" row={
            <TranslateBtn loading={!!trLoading.aboutDesc} onClick={() => translate("aboutDesc", draft.aboutDesc.id)} />
          }>
            <textarea rows={4} value={draft.aboutDesc.id} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, aboutDesc: { ...d.aboutDesc, id: e.target.value } }))} className={inputCls + " resize-none"} />
          </Field>
          <Field label="Deskripsi" hint="EN (auto)">
            <textarea rows={4} value={draft.aboutDesc.en} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, aboutDesc: { ...d.aboutDesc, en: e.target.value } }))} className={inputCls + " resize-none"} />
          </Field>
        </div>

        <SaveBar onSave={onSave} onCancel={onCancel} />
      </div>
    </Card>
  );
}

function TechTab({ draft, setDraft, onSave, onCancel }: any) {
  const [newTech, setNewTech] = useState({ category: "tools", name: "" });

  const addTech = () => {
    const name = newTech.name.trim().toLowerCase();
    if (!name) return;
    setDraft((d: PortfolioSettings) => ({
      ...d,
      techStack: { ...d.techStack, [newTech.category]: [...(d.techStack[newTech.category as keyof typeof d.techStack] as string[]), name] }
    }));
    setNewTech(n => ({ ...n, name: "" }));
  };

  const removeTech = (cat: string, name: string) => {
    setDraft((d: PortfolioSettings) => ({
      ...d,
      techStack: { ...d.techStack, [cat]: (d.techStack[cat as keyof typeof d.techStack] as string[]).filter(n => n !== name) }
    }));
  };

  return (
    <div className="space-y-4">
      <Card title="💻 Tambah Teknologi" subtitle="Cek nama di tech-stack-icons.com">
        <div className="space-y-3">
          <div className="flex gap-2">
            <select value={newTech.category} onChange={e => setNewTech(n => ({ ...n, category: e.target.value }))} className={inputCls + " w-32 flex-shrink-0"}>
              <option value="programming">Programming</option>
              <option value="framework">Framework</option>
              <option value="tools">Tools</option>
            </select>
            <input value={newTech.name} onChange={e => setNewTech(n => ({ ...n, name: e.target.value }))} onKeyDown={e => e.key === "Enter" && addTech()} placeholder="Nama icon (react, go, nodejs...)" className={inputCls + " flex-1"} />
            <motion.button whileTap={{ scale: 0.93 }} onClick={addTech} className="px-4 py-2 rounded-xl text-sm font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white" }}>+</motion.button>
          </div>

          {newTech.name && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: "rgba(8,8,14,0.6)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span className="text-xs text-white/40">Preview:</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(10,10,18,0.9)" }}>
                <StackIcon name={newTech.name.toLowerCase()} variant="dark" className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-white/60">{newTech.name}</span>
            </div>
          )}
        </div>
      </Card>

      {(["programming", "framework", "tools"] as const).map(cat => (
        <Card key={cat} title={cat.charAt(0).toUpperCase() + cat.slice(1)}>
          <div className="flex flex-wrap gap-2">
            {(draft.techStack[cat] as string[]).map((name: string) => (
              <div key={name} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl" style={{ background: "rgba(8,8,14,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <StackIcon name={name} variant="dark" className="w-3.5 h-3.5" />
                <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.55)" }}>{name}</span>
                <button onClick={() => removeTech(cat, name)} className="text-red-400/60 hover:text-red-400 text-xs ml-0.5">×</button>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <SaveBar onSave={onSave} onCancel={onCancel} />
    </div>
  );
}

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
    setDraft((d: PortfolioSettings) => ({
      ...d,
      projects: d.projects.map((p: ProjectItem) => p.id === projectId ? { ...p, desc: { ...p.desc, en: result } } : p)
    }));
  };

  const translateNewDesc = async () => {
    if (!newP.descId.trim()) return;
    setTrLoading(l => ({ ...l, "new": true }));
    const result = await autoTranslate(newP.descId);
    setTrLoading(l => ({ ...l, "new": false }));
    if (result) setNewP(n => ({ ...n, descEn: result }));
  };

  const updateProject = (id: string, field: string, value: string) => {
    setDraft((d: PortfolioSettings) => ({
      ...d,
      projects: d.projects.map((p: ProjectItem) => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const updateDesc = (id: string, lang: "id" | "en", value: string) => {
    setDraft((d: PortfolioSettings) => ({
      ...d,
      projects: d.projects.map((p: ProjectItem) => p.id === id ? { ...p, desc: { ...p.desc, [lang]: value } } : p)
    }));
  };

  const addProject = () => {
    if (!newP.name) return;
    setDraft((d: PortfolioSettings) => ({
      ...d,
      projects: [...d.projects, { id: Date.now().toString(), name: newP.name, image: newP.image, desc: { id: newP.descId, en: newP.descEn }, url: newP.url, buttonType: newP.buttonType }]
    }));
    setNewP({ name: "", image: "", descId: "", descEn: "", url: "", buttonType: "view" });
  };

  const removeProject = (id: string) => {
    setDraft((d: PortfolioSettings) => ({ ...d, projects: d.projects.filter((p: ProjectItem) => p.id !== id) }));
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
            <div className="flex gap-1.5">
              <button onClick={() => setEditing(editing === project.id ? null : project.id)} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-accent text-accent-foreground">{editing === project.id ? "Tutup" : "Edit"}</button>
              <button onClick={() => removeProject(project.id)} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: "hsl(var(--destructive)/0.1)", color: "hsl(var(--destructive))" }}>Hapus</button>
            </div>
          </div>

          <AnimatePresence>
            {editing === project.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Nama"><input value={project.name} onChange={e => updateProject(project.id, "name", e.target.value)} className={inputCls} /></Field>
                    <Field label="URL Gambar">
                      <input value={project.image} onChange={e => updateProject(project.id, "image", e.target.value)} className={inputCls} />
                      {project.image && <img src={project.image} alt="" className="mt-1.5 w-24 h-14 object-cover object-top rounded-lg border border-border" />}
                    </Field>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Deskripsi" hint="ID" row={<TranslateBtn loading={!!trLoading[project.id]} onClick={() => translateDesc(project.id, project.desc.id)} />}>
                      <textarea rows={2} value={project.desc.id} onChange={e => updateDesc(project.id, "id", e.target.value)} className={inputCls + " resize-none"} />
                    </Field>
                    <Field label="Deskripsi" hint="EN (auto)">
                      <textarea rows={2} value={project.desc.en} onChange={e => updateDesc(project.id, "en", e.target.value)} className={inputCls + " resize-none"} />
                    </Field>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="URL"><input value={project.url} onChange={e => updateProject(project.id, "url", e.target.value)} className={inputCls} /></Field>
                    <Field label="Tipe Tombol">
                      <select value={project.buttonType} onChange={e => updateProject(project.id, "buttonType", e.target.value)} className={inputCls}>
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

      <Card title="+ Tambah Proyek Baru">
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Nama"><input value={newP.name} onChange={e => setNewP(n => ({ ...n, name: e.target.value }))} className={inputCls} /></Field>
            <Field label="URL Gambar"><input value={newP.image} onChange={e => setNewP(n => ({ ...n, image: e.target.value }))} className={inputCls} placeholder="https://..." /></Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Deskripsi" hint="ID" row={<TranslateBtn loading={!!trLoading["new"]} onClick={translateNewDesc} />}>
              <textarea rows={2} value={newP.descId} onChange={e => setNewP(n => ({ ...n, descId: e.target.value }))} className={inputCls + " resize-none"} />
            </Field>
            <Field label="Deskripsi" hint="EN (auto)">
              <textarea rows={2} value={newP.descEn} onChange={e => setNewP(n => ({ ...n, descEn: e.target.value }))} className={inputCls + " resize-none"} />
            </Field>
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
          <motion.button whileTap={{ scale: 0.95 }} onClick={addProject} className="px-5 py-2.5 rounded-xl text-xs font-bold" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white" }}>
            + Tambah Proyek
          </motion.button>
        </div>
      </Card>

      <SaveBar onSave={onSave} onCancel={onCancel} />
    </div>
  );
}

function FriendsTab({ draft, setDraft, onSave, onCancel }: any) {
  return (
    <Card title="👥 Pengaturan Teman">
      <div className="space-y-4">
        <Field label="Daftar Teman" hint="satu per baris">
          <textarea rows={8} value={draft.friends.join("\n")} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, friends: e.target.value.split("\n").map((s: string) => s.trim()).filter(Boolean) }))} className={inputCls + " resize-none"} placeholder="Nama Teman 1&#10;Nama Teman 2&#10;..." />
        </Field>
        <div className="p-3 rounded-xl bg-accent/40">
          <p className="text-xs text-muted-foreground mb-2 font-semibold">Preview ({draft.friends.length} teman):</p>
          <div className="flex flex-wrap gap-1.5">
            {draft.friends.slice(0, 10).map((f: string, i: number) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-card border border-border text-foreground font-medium">{f}</span>
            ))}
            {draft.friends.length > 10 && <span className="text-xs text-muted-foreground px-2">+{draft.friends.length - 10} lagi</span>}
          </div>
        </div>
        <SaveBar onSave={onSave} onCancel={onCancel} />
      </div>
    </Card>
  );
}

const SOCIALS = [
  { key: "github", label: "GitHub", ph: "https://github.com/..." },
  { key: "instagram", label: "Instagram", ph: "https://instagram.com/..." },
  { key: "facebook", label: "Facebook", ph: "https://facebook.com/..." },
  { key: "youtube", label: "YouTube", ph: "https://youtube.com/@..." },
  { key: "telegram", label: "Telegram", ph: "https://t.me/..." },
  { key: "discord", label: "Discord", ph: "https://discord.gg/..." },
  { key: "email", label: "Email", ph: "nama@email.com" },
];

function SocialTab({ draft, setDraft, onSave, onCancel }: any) {
  return (
    <Card title="🔗 Pengaturan Media Sosial">
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          {SOCIALS.map(s => (
            <Field key={s.key} label={s.label}>
              <input value={draft.social[s.key] || ""} onChange={e => setDraft((d: PortfolioSettings) => ({ ...d, social: { ...d.social, [s.key]: e.target.value } }))} placeholder={s.ph} className={inputCls} />
            </Field>
          ))}
        </div>
        <SaveBar onSave={onSave} onCancel={onCancel} />
      </div>
    </Card>
  );
}

function SettingsTab({ draft, setDraft, onSave, onCancel, onReset }: any) {
  const { toast } = useToast();
  const [clock, setClock] = useState(new Date());
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleReset = () => {
    if (!confirmReset) { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 3000); return; }
    onReset();
    setConfirmReset(false);
    toast({ title: "Reset berhasil ✓", description: "Semua pengaturan dikembalikan ke default" });
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "aka-settings.json"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Diekspor ✓" });
  };

  const importSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        setDraft((d: any) => ({ ...d, ...parsed }));
        toast({ title: "Diimpor ✓", description: "Review lalu simpan" });
      } catch { toast({ title: "File tidak valid", variant: "destructive" }); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const sectionLabels: Record<string, string> = {
    about: "👤 Tentang",
    timeline: "📅 Pendidikan",
    stack: "💻 Tech Stack",
    projects: "💼 Proyek",
    friends: "👥 Teman",
    social: "🔗 Sosial Media",
    contact: "✉️ Kontak"
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}>
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Waktu Sekarang</p>
          <p className="text-2xl font-bold text-foreground tabular-nums">{clock.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
          <p className="text-[11px] text-muted-foreground">{clock.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <a href="/" target="_blank" rel="noopener" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-accent-foreground hover:bg-accent/80 transition-all">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Lihat Situs
          </a>
          <button onClick={() => { navigator.clipboard.writeText(window.location.origin); toast({ title: "URL disalin ✓" }); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-accent-foreground hover:bg-accent/80 transition-all">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Salin URL
          </button>
        </div>
      </div>

      <Card title="👁️ Visibilitas Seksi" subtitle="Tampilkan/sembunyikan seksi di portfolio">
        <div className="space-y-2.5">
          {Object.entries(sectionLabels).map(([key, label]) => {
            const isVisible = draft.sectionVisibility?.[key] !== false;
            return (
              <div key={key} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                <span className="text-sm text-foreground">{label}</span>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  data-testid={`visibility-${key}`}
                  onClick={() => setDraft((d: any) => ({ ...d, sectionVisibility: { ...d.sectionVisibility, [key]: !isVisible } }))}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: isVisible ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)",
                    color: isVisible ? "#22c55e" : "#ef4444",
                    border: `1px solid ${isVisible ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: isVisible ? "#22c55e" : "#ef4444" }} />
                  {isVisible ? "Tampil" : "Sembunyikan"}
                </motion.button>
              </div>
            );
          })}
        </div>
        <SaveBar onSave={onSave} onCancel={onCancel} />
      </Card>

      <Card title="🏫 Editor Pendidikan (Timeline)" subtitle="Edit nama sekolah dan tahun">
        <div className="space-y-3">
          {([
            { key: "sd", icon: "📚", label: "SD (Sekolah Dasar)" },
            { key: "mts", icon: "📖", label: "MTs / SMP" },
            { key: "sma", icon: "🎓", label: "SMA / SMK" }
          ] as const).map(({ key, icon, label }) => (
            <div key={key} className="p-3.5 rounded-xl bg-accent/30 border border-border/50 space-y-2">
              <p className="text-xs font-bold text-foreground/70">{icon} {label}</p>
              <div className="grid sm:grid-cols-2 gap-2">
                <Field label="Nama Sekolah">
                  <input
                    value={draft.timeline?.[key]?.name || ""}
                    onChange={e => setDraft((d: any) => ({ ...d, timeline: { ...d.timeline, [key]: { ...d.timeline?.[key], name: e.target.value } } }))}
                    className={inputCls}
                  />
                </Field>
                <Field label="Tahun">
                  <input
                    value={draft.timeline?.[key]?.year || ""}
                    onChange={e => setDraft((d: any) => ({ ...d, timeline: { ...d.timeline, [key]: { ...d.timeline?.[key], year: e.target.value } } }))}
                    className={inputCls}
                    placeholder="2020 - 2023"
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
        <SaveBar onSave={onSave} onCancel={onCancel} />
      </Card>

      <Card title="🔍 SEO & Meta" subtitle="Judul halaman dan deskripsi">
        <div className="space-y-3">
          <Field label="Judul Halaman">
            <input value={draft.seo?.title || ""} onChange={e => setDraft((d: any) => ({ ...d, seo: { ...d.seo, title: e.target.value } }))} className={inputCls} placeholder="aka — Portfolio" />
          </Field>
          <Field label="Deskripsi Meta">
            <textarea rows={2} value={draft.seo?.description || ""} onChange={e => setDraft((d: any) => ({ ...d, seo: { ...d.seo, description: e.target.value } }))} className={inputCls + " resize-none"} placeholder="Deskripsi singkat portfolio..." />
          </Field>
          <Field label="Teks Footer">
            <input value={draft.footerText || ""} onChange={e => setDraft((d: any) => ({ ...d, footerText: e.target.value }))} className={inputCls} placeholder="© 2026 Aka" />
          </Field>
        </div>
        <SaveBar onSave={onSave} onCancel={onCancel} />
      </Card>

      <Card title="📦 Ekspor / Impor Pengaturan" subtitle="Backup atau restore semua pengaturan">
        <div className="flex flex-wrap gap-2">
          <motion.button whileTap={{ scale: 0.95 }} onClick={exportSettings} className="px-4 py-2.5 rounded-xl text-xs font-bold" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white" }}>
            ↓ Ekspor JSON
          </motion.button>
          <label className="px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer bg-accent text-accent-foreground hover:bg-accent/80 transition-all">
            ↑ Impor JSON
            <input type="file" accept=".json" onChange={importSettings} className="hidden" />
          </label>
        </div>
      </Card>

      <Card title="🔁 Reset Pengaturan" subtitle="Kembalikan semua ke nilai default">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Semua perubahan yang kamu buat akan hilang dan kembali ke pengaturan bawaan. Tindakan ini tidak dapat dibatalkan.</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            data-testid="admin-reset"
            className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
            style={{
              background: confirmReset ? "hsl(var(--destructive))" : "hsl(var(--destructive)/0.1)",
              color: confirmReset ? "white" : "hsl(var(--destructive))",
              border: "1px solid hsl(var(--destructive)/0.3)"
            }}
          >
            {confirmReset ? "⚠️ Klik lagi untuk konfirmasi reset" : "Reset ke Default"}
          </motion.button>
        </div>
      </Card>
    </div>
  );
}

function AudioTab({ draft, setDraft, onSave, onCancel }: any) {
  const addTrack = () => {
    setDraft((d: PortfolioSettings) => ({ ...d, playlist: [...d.playlist, { id: Date.now().toString(), title: "Judul Lagu Baru", url: "" }] }));
  };

  const updateTrack = (id: string, field: string, value: string) => {
    setDraft((d: PortfolioSettings) => ({ ...d, playlist: d.playlist.map((t: PlaylistItem) => t.id === id ? { ...t, [field]: value } : t) }));
  };

  const removeTrack = (id: string) => {
    setDraft((d: PortfolioSettings) => ({ ...d, playlist: d.playlist.filter((t: PlaylistItem) => t.id !== id) }));
  };

  return (
    <div className="space-y-4">
      {draft.playlist.map((track: PlaylistItem, i: number) => (
        <Card key={track.id} title={`🎵 Lagu ${i + 1}: ${track.title}`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div />
              <button onClick={() => removeTrack(track.id)} className="px-2.5 py-1 rounded-lg text-xs" style={{ background: "hsl(var(--destructive)/0.1)", color: "hsl(var(--destructive))" }}>Hapus</button>
            </div>
            <Field label="Judul Lagu">
              <input value={track.title} onChange={e => updateTrack(track.id, "title", e.target.value)} className={inputCls} />
            </Field>
            <Field label="URL MP3">
              <input value={track.url} onChange={e => updateTrack(track.id, "url", e.target.value)} placeholder="https://..." className={inputCls} />
            </Field>
            {track.url && <audio controls src={track.url} className="w-full mt-1" style={{ height: 36, borderRadius: 8 }} />}
          </div>
        </Card>
      ))}

      <motion.button whileTap={{ scale: 0.95 }} onClick={addTrack} className="w-full py-3 rounded-2xl text-sm font-semibold border-2 border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-all">
        + Tambah Lagu
      </motion.button>

      <SaveBar onSave={onSave} onCancel={onCancel} />
    </div>
  );
}

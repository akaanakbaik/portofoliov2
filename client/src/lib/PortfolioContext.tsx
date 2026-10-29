import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { PORTFOLIO_CONFIG } from "./config";

export interface PlaylistItem {
  id: string;
  title: string;
  url: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  image: string;
  desc: { id: string; en: string };
  url: string;
  buttonType: string;
  imagePosition?: { x: number; y: number };
}

export interface TechStack {
  programming: string[];
  framework: string[];
  tools: string[];
}

export interface TimelineEntry {
  name: string;
  year: string;
}

export interface PortfolioSettings {
  name: string;
  photoUrl: string;
  faviconUrl: string;
  birthDate: string;
  origin: string;
  school: string;
  statusTexts: { id: string[]; en: string[] };
  aboutDesc: { id: string; en: string };
  friends: string[];
  techStack: TechStack;
  projects: ProjectItem[];
  social: Record<string, string>;
  playlist: PlaylistItem[];
  sectionVisibility: {
    about: boolean;
    timeline: boolean;
    stack: boolean;
    projects: boolean;
    friends: boolean;
    social: boolean;
    contact: boolean;
  };
  timeline: {
    sd: TimelineEntry;
    mts: TimelineEntry;
    sma: TimelineEntry;
  };
  footerText: string;
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
    canonical: string;
  };
  motion: { parallaxEnabled: boolean; parallaxIntensity: number };
}

interface PortfolioContextType {
  settings: PortfolioSettings;
  updateSettings: (partial: Partial<PortfolioSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const defaultSettings: PortfolioSettings = {
  name: PORTFOLIO_CONFIG.name,
  photoUrl: PORTFOLIO_CONFIG.photoUrl,
  faviconUrl: "/favicon.svg",
  birthDate: PORTFOLIO_CONFIG.birthDate,
  origin: PORTFOLIO_CONFIG.origin,
  school: PORTFOLIO_CONFIG.school,
  statusTexts: PORTFOLIO_CONFIG.statusTexts,
  aboutDesc: PORTFOLIO_CONFIG.aboutDesc,
  friends: PORTFOLIO_CONFIG.friends,
  techStack: PORTFOLIO_CONFIG.techStack,
  projects: PORTFOLIO_CONFIG.projects,
  social: PORTFOLIO_CONFIG.social,
  playlist: PORTFOLIO_CONFIG.playlist,
  sectionVisibility: {
    about: true,
    timeline: true,
    stack: true,
    projects: true,
    friends: true,
    social: true,
    contact: true,
  },
  timeline: {
    sd: { name: "SDN 13 Lembah Melintang", year: "2016 - 2022" },
    mts: { name: "MTsN 2 Pasaman Barat", year: "2022 - 2025" },
    sma: { name: "SMAN 1 Lembah Melintang", year: "2025 - Sekarang" },
  },
  footerText: "© 2026 Aka",
  seo: {
    title: "aka — Abdul Khaliq Arrasyid | Portfolio",
    description:
      "Kenali aka — Abdul Khaliq Arrasyid. Jelajahi proyek web, perjalanan belajar, dan kegiatan PMR dari pelajar SMAN 1 Lembah Melintang, Sumatera Barat.",
    keywords:
      "aka, bg aka, aka SMAN, aka SMAN 1 Lembah Melintang, Abdul Khaliq Arrasyid, aka PMR, akaanakbaik",
    ogImage: "https://akaa.dev/og-preview-v2.png",
    canonical: "https://akaa.dev/",
  },
  motion: {
    parallaxEnabled: true,
    parallaxIntensity: 0.35,
  },
};

const PortfolioContext = createContext<PortfolioContextType>({
  settings: defaultSettings,
  updateSettings: async () => {},
  resetSettings: async () => {},
});

export function PortfolioProvider({
  children,
  initialSettings,
}: {
  children: ReactNode;
  initialSettings?: PortfolioSettings;
}) {
  const [settings, setSettings] = useState<PortfolioSettings>(() => {
    if (
      typeof window !== "undefined" &&
      window.location.pathname === "/preview"
    ) {
      try {
        const draft = sessionStorage.getItem("aka-preview");
        if (draft) return JSON.parse(draft);
      } catch {}
    }
    return initialSettings || defaultSettings;
  });
  const version = useRef(0);
  const loaded = useRef(false);
  useEffect(() => {
    if (window.location.pathname === "/preview") return;
    let alive = true;
    fetch("/api/settings", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("Cannot load settings");
        return r.json();
      })
      .then((data) => {
        if (!alive) return;
        version.current = data.version;
        loaded.current = true;
        if (data.settings)
          setSettings({ ...defaultSettings, ...data.settings });
      })
      .catch(() => {
        loaded.current = false;
      });
    return () => {
      alive = false;
    };
  }, []);
  const updateSettings = async (partial: Partial<PortfolioSettings>) => {
    if (!loaded.current)
      throw new Error(
        "Pengaturan belum dimuat. Muat ulang halaman sebelum menyimpan.",
      );
    const next = { ...settings, ...partial };
    const r = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Token": sessionStorage.getItem("aka-admin-token") || "",
      },
      body: JSON.stringify({ settings: next, version: version.current }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Gagal menyimpan pengaturan");
    version.current = data.version;
    setSettings(next);
  };
  const resetSettings = () => updateSettings(defaultSettings);
  return (
    <PortfolioContext.Provider
      value={{ settings, updateSettings, resetSettings }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}
export const usePortfolio = () => useContext(PortfolioContext);

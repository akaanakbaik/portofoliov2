import { createContext, useContext, useState, ReactNode } from "react";
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
  seo: { title: string; description: string };
}

interface PortfolioContextType {
  settings: PortfolioSettings;
  updateSettings: (partial: Partial<PortfolioSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: PortfolioSettings = {
  name: PORTFOLIO_CONFIG.name,
  photoUrl: PORTFOLIO_CONFIG.photoUrl,
  faviconUrl: "https://raw.githubusercontent.com/akaanakbaik/my-cdn/main/portofolio/aka.jpg",
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
    contact: true
  },
  timeline: {
    sd: { name: "SDN 13 Lembah Melintang", year: "2016 - 2022" },
    mts: { name: "MTsN 2 Pasaman Barat", year: "2022 - 2025" },
    sma: { name: "SMAN 1 Lembah Melintang", year: "2025 - Sekarang" }
  },
  footerText: "© 2026 Aka",
  seo: {
    title: "aka — Portfolio",
    description: "Portfolio Aka, pelajar & developer dari Sumatera Barat Indonesia"
  }
};

const PortfolioContext = createContext<PortfolioContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  resetSettings: () => {}
});

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PortfolioSettings>(() => {
    try {
      const saved = localStorage.getItem("aka-portfolio-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultSettings,
          ...parsed,
          sectionVisibility: { ...defaultSettings.sectionVisibility, ...(parsed.sectionVisibility || {}) },
          timeline: { ...defaultSettings.timeline, ...(parsed.timeline || {}) },
          seo: { ...defaultSettings.seo, ...(parsed.seo || {}) }
        };
      }
    } catch {}
    return defaultSettings;
  });

  const updateSettings = (partial: Partial<PortfolioSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem("aka-portfolio-settings", JSON.stringify(next));
      return next;
    });
  };

  const resetSettings = () => {
    localStorage.removeItem("aka-portfolio-settings");
    setSettings(defaultSettings);
  };

  return (
    <PortfolioContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export const usePortfolio = () => useContext(PortfolioContext);

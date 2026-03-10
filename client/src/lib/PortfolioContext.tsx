import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

export interface PortfolioSettings {
  name: string;
  photoUrl: string;
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
}

interface PortfolioContextType {
  settings: PortfolioSettings;
  updateSettings: (partial: Partial<PortfolioSettings>) => void;
}

const defaultSettings: PortfolioSettings = {
  name: PORTFOLIO_CONFIG.name,
  photoUrl: PORTFOLIO_CONFIG.photoUrl,
  birthDate: PORTFOLIO_CONFIG.birthDate,
  origin: PORTFOLIO_CONFIG.origin,
  school: PORTFOLIO_CONFIG.school,
  statusTexts: PORTFOLIO_CONFIG.statusTexts,
  aboutDesc: PORTFOLIO_CONFIG.aboutDesc,
  friends: PORTFOLIO_CONFIG.friends,
  techStack: PORTFOLIO_CONFIG.techStack,
  projects: PORTFOLIO_CONFIG.projects,
  social: PORTFOLIO_CONFIG.social,
  playlist: PORTFOLIO_CONFIG.playlist
};

const PortfolioContext = createContext<PortfolioContextType>({
  settings: defaultSettings,
  updateSettings: () => {}
});

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PortfolioSettings>(() => {
    try {
      const saved = localStorage.getItem("aka-portfolio-settings");
      if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
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

  return (
    <PortfolioContext.Provider value={{ settings, updateSettings }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export const usePortfolio = () => useContext(PortfolioContext);

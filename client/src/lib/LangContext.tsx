import { createContext, useContext, useState, ReactNode } from "react";
import idLang from "./lang/id.json";
import enLang from "./lang/en.json";

type Lang = "id" | "en";

interface LangContextType {
  lang: Lang;
  t: typeof idLang;
  toggleLang: () => void;
}

const LangContext = createContext<LangContextType>({
  lang: "id",
  t: idLang,
  toggleLang: () => {}
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("aka-lang") as Lang) || "id";
    }
    return "id";
  });

  const t = lang === "id" ? idLang : enLang;

  const toggleLang = () => {
    const next = lang === "id" ? "en" : "id";
    setLang(next);
    localStorage.setItem("aka-lang", next);
  };

  return (
    <LangContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);

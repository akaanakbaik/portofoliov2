import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import AudioPlayer from "@/components/AudioPlayer";
import HomeSection from "@/components/sections/HomeSection";
import AboutSection from "@/components/sections/AboutSection";
import TimelineSection from "@/components/sections/TimelineSection";
import StackSection from "@/components/sections/StackSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import FriendsSection from "@/components/sections/FriendsSection";
import SocialSection from "@/components/sections/SocialSection";
import ContactSection from "@/components/sections/ContactSection";
import { usePortfolio } from "@/lib/PortfolioContext";
import { useLang } from "@/lib/LangContext";

const ALL_SECTIONS = ["home", "about", "timeline", "stack", "projects", "friends", "social", "contact"];

export default function Portfolio() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const closeSidebar=useCallback(()=>setSidebarOpen(false),[]);
  const { settings } = usePortfolio();
  const { lang } = useLang();
  const vis = settings.sectionVisibility;

  useEffect(() => {
    if(window.location.pathname==='/preview')return;
    fetch("/api/analytics/visit", { method: "POST" }).catch(() => {});
  }, []);

  useEffect(() => {
    const seo = settings.seo;
    document.querySelector('meta[name="robots"]')?.setAttribute("content",window.location.pathname==='/preview'?"noindex, nofollow":"index, follow, max-image-preview:large");
    if (seo?.title) document.title = seo.title;
    document.documentElement.lang = lang;
    const setMeta = (selector: string, content: string) => {
      if (!content) return;
      const meta = document.querySelector<HTMLMetaElement>(selector);
      if (meta) meta.content = content;
    };
    setMeta("meta[name='description']", seo?.description || "");
    setMeta("meta[name='keywords']", seo?.keywords || "");
    setMeta("meta[property='og:title']", seo?.title || "");
    setMeta("meta[property='og:description']", seo?.description || "");
    setMeta("meta[property='og:image']", seo?.ogImage || settings.photoUrl || "");
    setMeta("meta[property='og:url']", seo?.canonical || window.location.origin);
    setMeta("meta[name='twitter:title']", seo?.title || "");
    setMeta("meta[name='twitter:description']", seo?.description || "");
    setMeta("meta[name='twitter:image']", seo?.ogImage || settings.photoUrl || "");
    let canonical = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = seo?.canonical || window.location.origin;

  }, [lang, settings.name, settings.photoUrl, settings.seo]);

  useEffect(() => {
    const url = settings.faviconUrl;
    if (!url) return;
    let link = document.querySelector<HTMLLinkElement>("#portfolio-favicon");
    if (!link) { link = document.createElement("link"); link.rel = "icon"; link.id = "portfolio-favicon"; document.head.appendChild(link); }
    link.href = url;
    const path = new URL(url, window.location.origin).pathname.toLowerCase();
    link.type = path.endsWith(".svg") ? "image/svg+xml" : path.endsWith(".ico") ? "image/x-icon" : path.endsWith(".png") ? "image/png" : "image/jpeg";
    if (path === "/aka-icon-192.png") link.sizes.value = "192x192";
    else link.removeAttribute("sizes");
  }, [settings.faviconUrl]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    ALL_SECTIONS.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-16 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-primary-foreground">{lang === "id" ? "Lewati ke konten utama" : "Skip to main content"}</a>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        activeSection={activeSection}
      />

      <main id="main-content">
        {typeof window!=="undefined"&&window.location.pathname==='/preview'&&<div className="fixed top-16 left-4 right-4 z-40 rounded-xl bg-card border border-border p-3 text-center text-sm">Pratinjau pribadi — perubahan belum dipublikasikan. <button onClick={()=>window.close()} className="underline">Tutup pratinjau</button></div>}
        <HomeSection />
        {vis.about !== false && <AboutSection />}
        {vis.timeline !== false && <TimelineSection />}
        {vis.stack !== false && <StackSection />}
        {vis.projects !== false && <ProjectsSection />}
        {vis.friends !== false && <FriendsSection />}
        {vis.social !== false && <SocialSection />}
        {vis.contact !== false && <ContactSection />}
      </main>

      <Footer />
      <AudioPlayer />
    </div>
  );
}

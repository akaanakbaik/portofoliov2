import { useState, useEffect } from "react";
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
  const { settings } = usePortfolio();
  const { lang } = useLang();
  const vis = settings.sectionVisibility;

  useEffect(() => {
    fetch("/api/analytics/visit", { method: "POST" }).catch(() => {});
  }, []);

  useEffect(() => {
    const seo = settings.seo;
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
    const personSchema = document.querySelector<HTMLScriptElement>("script[type='application/ld+json']");
    if (personSchema) {
      try {
        const parsed = JSON.parse(personSchema.textContent || "{}");
        parsed.name = settings.name;
        parsed.description = seo?.description || parsed.description;
        parsed.url = seo?.canonical || parsed.url;
        if (seo?.ogImage || settings.photoUrl) parsed.image = { "@type": "ImageObject", url: seo?.ogImage || settings.photoUrl, contentUrl: seo?.ogImage || settings.photoUrl };
        personSchema.textContent = JSON.stringify(parsed);
      } catch {}
    }
  }, [lang, settings.name, settings.photoUrl, settings.seo]);

  useEffect(() => {
    const url = settings.faviconUrl;
    if (!url) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.href = url;
    link.type = url.endsWith(".svg") ? "image/svg+xml" : url.endsWith(".ico") ? "image/x-icon" : "image/jpeg";
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
        onClose={() => setSidebarOpen(false)}
        activeSection={activeSection}
      />

      <main id="main-content">
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

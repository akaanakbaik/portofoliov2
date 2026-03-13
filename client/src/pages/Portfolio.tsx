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

const ALL_SECTIONS = ["home", "about", "timeline", "stack", "projects", "friends", "contact"];

export default function Portfolio() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const { settings } = usePortfolio();
  const vis = settings.sectionVisibility;

  useEffect(() => {
    fetch("/api/analytics/visit", { method: "POST" }).catch(() => {});
  }, []);

  useEffect(() => {
    if (settings.seo?.title) document.title = settings.seo.title;
    const metaDesc = document.querySelector<HTMLMetaElement>("meta[name='description']");
    if (metaDesc && settings.seo?.description) metaDesc.content = settings.seo.description;
  }, [settings.seo]);

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
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeSection={activeSection}
      />

      <main>
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

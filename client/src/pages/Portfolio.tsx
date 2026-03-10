import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
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

const SECTIONS = ["home", "about", "timeline", "stack", "projects", "friends", "contact"];

export default function Portfolio() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    fetch("/api/analytics/visit", { method: "POST" }).catch(() => {});
  }, []);

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

    SECTIONS.forEach(id => {
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
        <AboutSection />
        <TimelineSection />
        <StackSection />
        <ProjectsSection />
        <FriendsSection />
        <SocialSection />
        <ContactSection />
      </main>

      <Footer />
      <AudioPlayer />
    </div>
  );
}

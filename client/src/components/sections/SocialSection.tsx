import { motion } from "framer-motion";
import { useLang } from "@/lib/LangContext";
import { usePortfolio } from "@/lib/PortfolioContext";
import { SiGithub, SiInstagram, SiFacebook, SiYoutube, SiTelegram, SiDiscord } from "react-icons/si";
import { Mail } from "lucide-react";

const SOCIAL_ICONS: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  github: { icon: <SiGithub size={20} />, color: "#e5e7eb", label: "GitHub" },
  instagram: { icon: <SiInstagram size={20} />, color: "#E1306C", label: "Instagram" },
  facebook: { icon: <SiFacebook size={20} />, color: "#1877F2", label: "Facebook" },
  youtube: { icon: <SiYoutube size={20} />, color: "#FF0000", label: "YouTube" },
  telegram: { icon: <SiTelegram size={20} />, color: "#26A5E4", label: "Telegram" },
  discord: { icon: <SiDiscord size={20} />, color: "#5865F2", label: "Discord" },
  email: { icon: <Mail size={20} />, color: "#EA4335", label: "Email" }
};

export default function SocialSection() {
  const { t } = useLang();
  const { settings } = usePortfolio();
  const socials = Object.entries(settings.social).filter(([, url]) => url && url.length > 0);

  return (
    <section id="social" className="py-14 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-7"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}>
            {t.social.title}
          </h2>
          <div className="w-8 h-0.5 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-blue-600 mb-2.5" />
          <p className="text-xs text-muted-foreground">{t.social.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {socials.map(([platform, url], i) => {
            const info = SOCIAL_ICONS[platform];
            if (!info) return null;
            return (
              <motion.a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -3, scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl"
                style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))", textDecoration: "none" }}
                data-testid={`social-${platform}`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${info.color}15`, color: info.color }}>
                  {info.icon}
                </div>
                <span className="text-[11px] font-semibold text-card-foreground">{info.label}</span>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

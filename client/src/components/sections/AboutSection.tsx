import { motion } from "framer-motion";
import { useLang } from "@/lib/LangContext";
import { usePortfolio } from "@/lib/PortfolioContext";
import { calculateAge } from "@/lib/config";

export default function AboutSection() {
  const { t, lang } = useLang();
  const { settings } = usePortfolio();
  const age = calculateAge(settings.birthDate);

  const cards = [
    { id: "age", icon: "🎂", label: t.about.age, value: lang === "id" ? `${age} Tahun` : `${age} Years Old` },
    { id: "origin", icon: "📍", label: t.about.origin, value: settings.origin },
    { id: "school", icon: "🏫", label: t.about.school, value: settings.school }
  ];

  return (
    <section id="about" className="py-14 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }} data-testid="about-title">
            {t.about.title}
          </h2>
          <div className="w-8 h-0.5 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-blue-600" />
        </motion.div>

        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-30px" }}
              transition={{ delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="rounded-xl p-3 flex flex-col items-center gap-1.5 text-center"
              style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
              data-testid={`about-card-${card.id}`}
            >
              <span className="text-lg">{card.icon}</span>
              <div>
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">{card.label}</p>
                <p className="text-xs font-semibold text-card-foreground leading-snug">{card.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="rounded-xl p-5"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
        >
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "hsl(217 91% 60%)" }}>
            {t.about.descTitle}
          </h3>
          <p className="text-sm leading-relaxed text-card-foreground/75" data-testid="about-desc">
            {lang === "id" ? settings.aboutDesc.id : settings.aboutDesc.en}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

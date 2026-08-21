import { motion } from "framer-motion";
import { useLang } from "@/lib/LangContext";
import { usePortfolio } from "@/lib/PortfolioContext";

export default function ProjectsSection() {
  const { t, lang } = useLang();
  const { settings } = usePortfolio();

  return (
    <section id="projects" className="py-16 px-4 scroll-mt-20">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">{lang === "id" ? "Karya terpilih" : "Selected work"}</p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}>
            {t.projects.title}
          </h2>
          <div className="w-8 h-0.5 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-blue-600" />
        </motion.div>

        <div className="relative -mx-4 md:mx-0">
          <div className="absolute left-0 top-0 bottom-0 w-10 md:w-14 z-10 pointer-events-none bg-gradient-to-r from-background to-transparent" aria-hidden="true" />
          <div className="absolute right-0 top-0 bottom-0 w-10 md:w-14 z-10 pointer-events-none bg-gradient-to-l from-background to-transparent" aria-hidden="true" />
          <div
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory overscroll-x-contain px-4 md:px-1 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="list"
            tabIndex={0}
            aria-label={lang === "id" ? "Daftar project" : "Project list"}
          >
            {settings.projects.map((project, i) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: Math.min(i * 0.06, 0.24), duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="w-[min(82vw,330px)] md:w-[330px] flex-shrink-0 snap-start rounded-2xl overflow-hidden flex flex-col"
                style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", willChange: "transform" }}
                role="listitem"
                data-testid={`project-card-${project.id}`}
              >
                <div className="relative overflow-hidden aspect-[16/9]">
                  <img src={project.image} alt={project.name} className="w-full h-full object-cover object-top" loading={i < 3 ? "eager" : "lazy"} decoding="async" draggable={false} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 55%, hsl(var(--card)) 100%)" }} />
                </div>

                <div className="p-4 flex flex-col flex-1 gap-3 min-h-[156px]">
                  <div>
                    <h3 className="text-base font-bold text-card-foreground leading-tight" data-testid={`project-name-${project.id}`}>{project.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-2 line-clamp-3" data-testid={`project-desc-${project.id}`}>
                      {lang === "id" ? project.desc.id : project.desc.en}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {project.buttonType === "group" ? (lang === "id" ? "Komunitas" : "Community") : (lang === "id" ? "Web project" : "Web project")}
                    </span>
                    <motion.a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileTap={{ scale: 0.96 }}
                      className="inline-flex items-center justify-center py-2 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap"
                      style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", boxShadow: "0 2px 8px hsl(217 91% 58% / 0.3)" }}
                      data-testid={`project-view-${project.id}`}
                      aria-label={`${project.buttonType === "group" ? t.projects.joinGroup : t.projects.view}: ${project.name}`}
                    >
                      {project.buttonType === "group" ? t.projects.joinGroup : t.projects.view}
                    </motion.a>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

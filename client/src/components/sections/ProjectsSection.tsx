import { useRef } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/LangContext";
import { usePortfolio } from "@/lib/PortfolioContext";

export default function ProjectsSection() {
  const { t, lang } = useLang();
  const { settings } = usePortfolio();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0);
    scrollLeft.current = scrollRef.current?.scrollLeft || 0;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft = scrollLeft.current - (x - startX.current);
  };
  const onMouseUp = () => { isDragging.current = false; };

  return (
    <section id="projects" className="py-14 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-7 px-4"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}>
            {t.projects.title}
          </h2>
          <div className="w-8 h-0.5 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-blue-600" />
        </motion.div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 px-5 cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: "none" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {settings.projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="flex-shrink-0 rounded-2xl overflow-hidden flex flex-col"
              style={{ width: 220, background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", willChange: "transform" }}
              data-testid={`project-card-${project.id}`}
            >
              <div className="relative overflow-hidden" style={{ height: 130 }}>
                <img src={project.image} alt={project.name} className="w-full h-full object-cover object-top" draggable={false} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 55%, hsl(var(--card)) 100%)" }} />
              </div>

              <div className="p-3.5 flex flex-col flex-1 gap-2">
                <h3 className="text-sm font-bold text-card-foreground leading-tight" data-testid={`project-name-${project.id}`}>{project.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1 line-clamp-3" data-testid={`project-desc-${project.id}`}>
                  {lang === "id" ? project.desc.id : project.desc.en}
                </p>
                <motion.a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileTap={{ scale: 0.96 }}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-center"
                  style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", boxShadow: "0 2px 8px hsl(217 91% 58% / 0.3)" }}
                  data-testid={`project-view-${project.id}`}
                  onClick={e => e.stopPropagation()}
                >
                  {project.buttonType === "group" ? t.projects.joinGroup : t.projects.view}
                </motion.a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

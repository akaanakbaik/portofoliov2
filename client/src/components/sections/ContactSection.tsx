import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/LangContext";
import { useToast } from "@/hooks/use-toast";

export default function ContactSection() {
  const { t } = useLang();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSent(true);
        setForm({ name: "", email: "", message: "" });
        toast({ title: t.contact.successTitle, description: t.contact.successDesc });
        setTimeout(() => setSent(false), 5000);
      } else throw new Error();
    } catch {
      toast({ title: t.contact.errorTitle, description: t.contact.errorDesc, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const fieldStyle = {
    background: "hsl(var(--background))",
    border: "1px solid hsl(var(--border))",
    color: "hsl(var(--foreground))"
  };

  const fieldFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = "hsl(217 91% 58% / 0.6)";
    e.currentTarget.style.boxShadow = "0 0 0 3px hsl(217 91% 58% / 0.1)";
  };

  const fieldBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = "hsl(var(--border))";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <section id="contact" className="py-14 px-4">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-7"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}>
            {t.contact.title}
          </h2>
          <div className="w-8 h-0.5 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-blue-600 mb-2.5" />
          <p className="text-xs text-muted-foreground">{t.contact.subtitle}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl p-5"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}
        >
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="py-10 text-center space-y-3"
              >
                <motion.div
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl"
                >✅</motion.div>
                <p className="text-base font-bold text-foreground">{t.contact.successTitle}</p>
                <p className="text-xs text-muted-foreground">{t.contact.successDesc}</p>
              </motion.div>
            ) : (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">{t.contact.name}</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder={t.contact.namePlaceholder}
                    required
                    data-testid="contact-name"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={fieldStyle}
                    onFocus={fieldFocus}
                    onBlur={fieldBlur}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">{t.contact.email}</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder={t.contact.emailPlaceholder}
                    required
                    data-testid="contact-email"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={fieldStyle}
                    onFocus={fieldFocus}
                    onBlur={fieldBlur}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">{t.contact.message}</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder={t.contact.messagePlaceholder}
                    required
                    rows={4}
                    data-testid="contact-message"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all resize-none"
                    style={fieldStyle}
                    onFocus={fieldFocus}
                    onBlur={fieldBlur}
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={sending}
                  whileTap={{ scale: 0.97 }}
                  data-testid="contact-send"
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: sending ? "hsl(var(--muted))" : "linear-gradient(135deg, hsl(217 91% 54%), hsl(240 70% 60%))",
                    color: sending ? "hsl(var(--muted-foreground))" : "white",
                    boxShadow: sending ? "none" : "0 4px 18px hsl(217 91% 58% / 0.3)"
                  }}
                >
                  {sending ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} className="block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                      {t.contact.sending}
                    </span>
                  ) : t.contact.send}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

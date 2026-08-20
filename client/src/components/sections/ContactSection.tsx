import { useEffect, useState } from "react";
import { SvgIcon } from "@/components/SvgIcon";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/LangContext";
import { useToast } from "@/hooks/use-toast";

export default function ContactSection() {
  const { t, lang } = useLang();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setErrors({});
  }, [lang]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = lang === "id" ? "Nama wajib diisi." : "Name is required.";
    if (!form.email.trim()) nextErrors.email = lang === "id" ? "Email wajib diisi." : "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) nextErrors.email = lang === "id" ? "Gunakan format email yang valid." : "Use a valid email format.";
    if (!form.message.trim()) nextErrors.message = lang === "id" ? "Pesan wajib diisi." : "Message is required.";
    else if (form.message.trim().length < 5) nextErrors.message = lang === "id" ? "Pesan minimal 5 karakter." : "Message must be at least 5 characters.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Request failed");
      setSent(true);
      setErrors({});
      setForm({ name: "", email: "", message: "" });
      toast({ title: t.contact.successTitle, description: t.contact.successDesc });
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      const message = error instanceof Error ? error.message : t.contact.errorDesc;
      toast({ title: t.contact.errorTitle, description: message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const updateField = (field: keyof typeof form, value: string) => {
    setForm(current => ({ ...current, [field]: value }));
    if (errors[field]) setErrors(current => ({ ...current, [field]: "" }));
  };

  const fieldStyle = { background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" };
  const fieldFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = "hsl(217 91% 58% / 0.6)"; e.currentTarget.style.boxShadow = "0 0 0 3px hsl(217 91% 58% / 0.1)"; };
  const fieldBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = "hsl(var(--border))"; e.currentTarget.style.boxShadow = "none"; };

  return (
    <section id="contact" className="py-16 px-4 scroll-mt-20">
      <div className="max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">{lang === "id" ? "Mari terhubung" : "Let's connect"}</p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}>{t.contact.title}</h2>
          <div className="w-8 h-0.5 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-blue-600 mb-2.5" />
          <p className="text-xs text-muted-foreground">{t.contact.subtitle}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="rounded-2xl p-5 bg-card border border-border shadow-sm">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="py-10 text-center space-y-3" role="status" aria-live="polite">
                <div className="text-emerald-400" aria-hidden="true"><SvgIcon name="check-circle" size={40} /></div>
                <p className="text-base font-bold text-foreground">{t.contact.successTitle}</p>
                <p className="text-xs text-muted-foreground">{t.contact.successDesc}</p>
                <button type="button" onClick={() => setSent(false)} className="text-xs font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">{lang === "id" ? "Kirim pesan lain" : "Send another message"}</button>
              </motion.div>
            ) : (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} noValidate className="space-y-4" aria-describedby="contact-helper">
                <p id="contact-helper" className="text-xs text-muted-foreground">{lang === "id" ? "Saya akan membaca pesanmu dan membalas melalui email." : "I will read your message and reply by email."}</p>
                <div>
                  <label htmlFor="contact-name" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">{t.contact.name}</label>
                  <input id="contact-name" name="name" autoComplete="name" type="text" value={form.name} onChange={e => updateField("name", e.target.value)} placeholder={t.contact.namePlaceholder} required aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "contact-name-error" : undefined} data-testid="contact-name" className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring" style={fieldStyle} onFocus={fieldFocus} onBlur={fieldBlur} />
                  {errors.name && <p id="contact-name-error" className="mt-1 text-xs text-destructive" role="alert">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="contact-email" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">{t.contact.email}</label>
                  <input id="contact-email" name="email" autoComplete="email" type="email" value={form.email} onChange={e => updateField("email", e.target.value)} placeholder={t.contact.emailPlaceholder} required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "contact-email-error" : undefined} data-testid="contact-email" className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring" style={fieldStyle} onFocus={fieldFocus} onBlur={fieldBlur} />
                  {errors.email && <p id="contact-email-error" className="mt-1 text-xs text-destructive" role="alert">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="contact-message" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">{t.contact.message}</label>
                  <textarea id="contact-message" name="message" maxLength={1000} value={form.message} onChange={e => updateField("message", e.target.value)} placeholder={t.contact.messagePlaceholder} required aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "contact-message-error" : "contact-message-count"} rows={5} data-testid="contact-message" className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all resize-none focus-visible:ring-2 focus-visible:ring-ring" style={fieldStyle} onFocus={fieldFocus} onBlur={fieldBlur} />
                  <div className="mt-1 flex items-center justify-between gap-2"><span>{errors.message && <span id="contact-message-error" className="text-xs text-destructive" role="alert">{errors.message}</span>}</span><span id="contact-message-count" className="text-[10px] text-muted-foreground">{form.message.length}/1000</span></div>
                </div>
                <motion.button type="submit" disabled={sending} whileTap={{ scale: 0.97 }} data-testid="contact-send" className="w-full py-3 rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-wait" style={{ background: sending ? "hsl(var(--muted))" : "linear-gradient(135deg, hsl(217 91% 54%), hsl(240 70% 60%))", color: sending ? "hsl(var(--muted-foreground))" : "white", boxShadow: sending ? "none" : "0 4px 18px hsl(217 91% 58% / 0.3)" }}>
                  {sending ? <span className="flex items-center justify-center gap-2"><span aria-hidden="true" className="block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />{t.contact.sending}</span> : t.contact.send}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

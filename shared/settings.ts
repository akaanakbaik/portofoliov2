import { z } from "zod";
const text = z.string().max(5000);
const url = z
  .string()
  .max(2048)
  .refine((v) => {
    try {
      const u = new URL(v, "https://akaa.dev");
      return (
        ["https:", "http:"].includes(u.protocol) && !u.username && !u.password
      );
    } catch {
      return false;
    }
  }, "Gunakan URL http/https");
const socialUrl = z
  .string()
  .max(2048)
  .refine((v) => {
    try {
      return ["https:", "http:", "mailto:"].includes(new URL(v).protocol);
    } catch {
      return false;
    }
  });
const translated = z.object({ id: text, en: text });
export const settingsSchema = z.object({
  name: z.string().trim().min(1).max(100),
  photoUrl: url,
  faviconUrl: url,
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  origin: text,
  school: text,
  statusTexts: z.object({
    id: z.array(z.string().max(200)).min(1).max(20),
    en: z.array(z.string().max(200)).min(1).max(20),
  }),
  aboutDesc: translated,
  friends: z.array(z.string().max(100)).max(100),
  techStack: z.object({
    programming: z.array(z.string().max(60)).max(80),
    framework: z.array(z.string().max(60)).max(80),
    tools: z.array(z.string().max(60)).max(100),
  }),
  projects: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        name: z.string().min(1).max(150),
        image: url,
        desc: translated,
        url,
        buttonType: z.string().max(30),
        imagePosition: z
          .object({
            x: z.number().min(0).max(100),
            y: z.number().min(0).max(100),
          })
          .optional(),
      }),
    )
    .max(50),
  social: z.record(z.string(), socialUrl),
  playlist: z
    .array(
      z.object({ id: z.string().max(100), title: z.string().max(200), url }),
    )
    .max(50),
  sectionVisibility: z.object({
    about: z.boolean(),
    timeline: z.boolean(),
    stack: z.boolean(),
    projects: z.boolean(),
    friends: z.boolean(),
    social: z.boolean(),
    contact: z.boolean(),
  }),
  timeline: z.object({
    sd: z.object({ name: text, year: text }),
    mts: z.object({ name: text, year: text }),
    sma: z.object({ name: text, year: text }),
  }),
  footerText: text,
  seo: z.object({
    title: z.string().min(1).max(120),
    description: z.string().max(500),
    keywords: z.string().max(1000),
    ogImage: url,
    canonical: z.literal("https://akaa.dev/"),
  }),
  motion: z.object({
    parallaxEnabled: z.boolean(),
    parallaxIntensity: z.number().min(0).max(0.75),
  }),
});

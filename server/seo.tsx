import React from "react";
import { Router } from "wouter";
import { renderToString } from "react-dom/server";
import { MotionConfig } from "framer-motion";
import Portfolio from "../client/src/pages/Portfolio";
import {
  PortfolioProvider,
  defaultSettings,
  type PortfolioSettings,
} from "../client/src/lib/PortfolioContext";
import { LangProvider } from "../client/src/lib/LangContext";
import { ThemeProvider } from "../client/src/lib/ThemeContext";
import { db } from "./backend";
import { shell } from "./generated-shell";
import { imageMetadata } from "../shared/seo";
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const json = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
let lastPublishedSettings: PortfolioSettings = defaultSettings;
export async function renderPage() {
  let stored;
  try { stored=await db('settings.get'); }
  catch { console.error('[seo] Database unavailable; serving last known portfolio content');stored={settings:lastPublishedSettings}; }
  const settings: PortfolioSettings = {
    ...defaultSettings,
    ...stored.settings,
  };
  lastPublishedSettings=settings;
  const content = renderToString(
    <Router ssrPath="/">
      <MotionConfig reducedMotion="always">
        <ThemeProvider>
          <LangProvider>
            <PortfolioProvider initialSettings={settings}>
              <Portfolio />
            </PortfolioProvider>
          </LangProvider>
        </ThemeProvider>
      </MotionConfig>
    </Router>,
  );
  let html = shell.replace(
    '<div id="root"></div>',
    () => `<div id="root">${content.replace(/opacity:0(?=;|\")/g, "opacity:1")}</div>`,
  );
  html = html.replace(
    /<title>[\s\S]*?<\/title>/,
    () => `<title>${escape(settings.seo.title)}</title>`,
  );
  const socialImage = imageMetadata(settings.seo.ogImage);
  const favicon = imageMetadata(settings.faviconUrl);
  html = html.replace(/<link id="portfolio-favicon"[^>]*>/, () =>
    `<link id="portfolio-favicon" rel="icon" href="${escape(favicon.url)}"${favicon.type ? ` type="${favicon.type}"` : ""}${favicon.width ? ` sizes="${favicon.width}x${favicon.height}"` : ""} />`);
  const meta: Record<string, string> = {
    description: settings.seo.description,
    keywords: settings.seo.keywords,
    "og:title": settings.seo.title,
    "og:description": settings.seo.description,
    "og:image": socialImage.url,
    "og:image:secure_url": socialImage.url,
    "twitter:title": settings.seo.title,
    "twitter:description": settings.seo.description,
    "twitter:image": socialImage.url,
  };
  for (const [name, value] of Object.entries(meta))
    html = html.replace(
      new RegExp(
        `(<meta (?:name|property)="${name}" content=")[^"]*("\\s*\\/?>)`,
      ),
      `$1${escape(value).replace(/\$/g, "$$$$")}$2`,
    );
  for (const [name, value] of Object.entries({
    "og:image:type": socialImage.type,
    "og:image:width": socialImage.width,
    "og:image:height": socialImage.height,
  })) {
    html = html.replace(new RegExp(`<meta property="${name}"[^>]*>`, "g"),
      () => value === undefined ? "" : `<meta property="${name}" content="${escape(String(value))}" />`);
  }
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://akaa.dev/#person",
        name: "Abdul Khaliq Arrasyid",
        alternateName: Array.from(new Set([settings.name, "aka", "akaanakbaik"])),
        url: "https://akaa.dev/",
        description: settings.seo.description,
        image: new URL(settings.photoUrl, "https://akaa.dev").href,
        jobTitle: "Pelajar dan Web Developer",
        affiliation: {
          "@type": "EducationalOrganization",
          name: settings.school,
        },
        sameAs: Object.values(settings.social).filter((u) =>
          u.startsWith("https://"),
        ),
      },
      {
        "@type": "ProfilePage",
        "@id": "https://akaa.dev/#profile",
        url: "https://akaa.dev/",
        name: settings.seo.title,
        mainEntity: { "@id": "https://akaa.dev/#person" },
        inLanguage: ["id", "en"],
      },
      {
        "@type": "WebSite",
        "@id": "https://akaa.dev/#website",
        url: "https://akaa.dev/",
        name: "akaa.dev",
        alternateName: ["aka", "aka dev", "akaa dev", "aka Portfolio"],
        publisher: { "@id": "https://akaa.dev/#person" },
      },
    ],
  };
  html = html
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "")
    .replace(
      "</head>",
      () => `<script type="application/ld+json">${json(schema)}</script></head>`,
    );
  html=html.replace('</body>',()=>`<script id="portfolio-data" type="application/json">${json(settings)}</script></body>`);
  return html.replace('<html lang="id"', '<html lang="id" class="dark"');
}

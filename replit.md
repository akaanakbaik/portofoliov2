# Aka Portfolio

## Overview
A premium, full-featured personal portfolio website for "aka" - a 16-year-old student/developer from West Sumatra, Indonesia. Built with React + Vite + TypeScript + Tailwind CSS.

## Features
- **Single Page Portfolio** with sections: Home, About, Timeline, Tech Stack, Projects, Friends, Social Media, Contact
- **Bilingual** - Indonesian / English language toggle with flag icons
- **Dark/Light Theme** - smooth animated toggle
- **Floating Audio Player** - premium mini player with 3 songs, auto-minimize, expand/collapse. Uses vanilla `new Audio()` ref outside React for persistence.
- **Admin Dashboard** - secret path `/x7k9adm2p4q`, accessed by clicking footer copyright 10x in 4.3s, password: "AKA ANAK BAIK"
- **Auto-Translate API** - `/api/translate` endpoint (Google Translate gtx + MyMemory fallback) used by Admin to auto-translate ID→EN descriptions
- **Contact Form** - sends email via Nodemailer (Gmail) to portfolio owner

## Sections
1. **Home** - Profile photo, name, typing status animation, subtle glow effects
2. **About** - 3-column compact info cards (age auto-calculated, origin, school) + description card
3. **Timeline** - Education history (SD, MTS, SMA) with horizontal auto-scroll + popup on click
4. **Tech Stack** - Dark scrollable card with tech icons from `tech-stack-icons` library (dark variant), tooltip on long-press
5. **Projects** - Horizontal drag-scroll cards with project images, descriptions, view links
6. **Friends** - Auto-scrolling infinite horizontal ticker with friend names
7. **Social Media** - 3-col mobile / 4-col desktop grid cards linking to all social platforms
8. **Contact** - Form with name, email, message - sends via nodemailer

## Spacing
All sections use `py-14` for compact, professional spacing (down from `py-20`). Section headings use `letterSpacing: "-0.02em"` and accent divider `w-8 h-0.5`.

## Tech Stack
- Frontend: React + Vite + TypeScript + Tailwind CSS + Framer Motion
- Backend: Express.js + Nodemailer + Node.js built-in `https` module for translation
- Icons: `tech-stack-icons` (default export), `lucide-react`, `react-icons`
- Routing: wouter

## Admin Dashboard Features (Tab-Based, Mobile-Friendly)
- Horizontal scrollable tab bar at top - no sidebar
- Tabs: Analytics, Home (beranda), About (tentang), Tech Stack, Projects (proyek), Friends (teman), Social Media (medsos), Audio
- Visitor analytics with 7-day history bar chart + language stats bar chart
- **Auto-translate**: All bilingual text fields (status texts, about description, project descriptions) have an "ID→EN" translate button calling `/api/translate`
- Settings for all portfolio data, persisted in localStorage key `aka-portfolio-settings`
- Admin session in sessionStorage key `aka-admin-auth`

## Translation API
- Endpoint: `POST /api/translate` — body: `{ text: string }` — response: `{ ok: true, result: string }`
- Engine 1: Google Translate free gtx API
- Engine 2: MyMemory fallback
- Intended for Indonesian → English only (descriptions, not titles or URLs)

## Environment Variables
- `EMAIL_USER`: Gmail address for sending contact form emails
- `EMAIL_PASS`: Gmail app password
- `EMAIL_RECIPIENT`: Recipient email for contact form messages
- `SESSION_SECRET`: Secret key for session management

## Secret Admin Access
1. Scroll to the footer
2. Click "© 2026 Aka" exactly 10 times within 4.3 seconds
3. You'll be redirected to the admin login page
4. Enter password: "AKA ANAK BAIK"

## Key Files
- `client/src/lib/config.ts` - All portfolio data configuration
- `client/src/lib/lang/id.json` - Indonesian translations
- `client/src/lib/lang/en.json` - English translations
- `client/src/lib/ThemeContext.tsx` - Theme management
- `client/src/lib/LangContext.tsx` - Language management
- `client/src/lib/PortfolioContext.tsx` - Portfolio settings management
- `client/src/pages/Portfolio.tsx` - Main portfolio page
- `client/src/pages/Admin.tsx` - Admin dashboard (tab-based, mobile-friendly)
- `client/src/components/AudioPlayer.tsx` - Floating audio player
- `client/src/components/sections/` - All portfolio sections
- `server/routes.ts` - API endpoints (contact, analytics, translate)

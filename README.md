# 🌐 Portfolio aka — v2

> Portfolio personal **aka** (Abdul Khaliq Arrasyid), pelajar kelas 10 & developer muda dari Sumatera Barat, Indonesia.

[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://akadev.me)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## ✨ Fitur Utama

| Fitur | Detail |
|---|---|
| 🌙 Dark / Light Mode | Toggle otomatis, tersimpan di localStorage |
| 🇮🇩 / 🇬🇧 Bilingual | Bahasa Indonesia & English, auto-switch |
| 🎵 Floating Audio Player | Playlist MP3, persist saat scroll |
| 📱 Fully Responsive | Mobile-first, optimal di semua ukuran layar |
| ⚙️ Admin Dashboard | Panel tersembunyi untuk edit semua konten secara real-time |
| 📊 Visitor Analytics | Statistik kunjungan harian + grafik |
| 🔐 Secure Auth | Token HMAC-SHA256 stateless — kompatibel Vercel serverless |
| 🔍 Professional SEO | Open Graph, Twitter Card, JSON-LD Schema |
| ✉️ Contact Form | Pesan masuk ke inbox admin + notifikasi Gmail SMTP |
| 🚀 Vercel Ready | Deploy sekali klik, zero-config |

---

## 🎨 Desain

- **Font**: Plus Jakarta Sans (Google Fonts)
- **Palet Warna**: Biru `#3b82f6` → Ungu `#6366f1`
- **Animasi**: Framer Motion — spring, viewport-triggered, stagger
- **Komponen**: shadcn/ui + Tailwind CSS
- **Background**: Radial gradient orbs animasi halus

---

## 📁 Struktur Proyek

```
portofoliov2/
├── client/                    # Frontend (React + Vite)
│   ├── index.html             # Entry HTML + SEO meta tags
│   └── src/
│       ├── App.tsx            # Router utama (wouter)
│       ├── lib/
│       │   ├── config.ts      # ⭐ KONFIGURASI UTAMA portfolio
│       │   ├── PortfolioContext.tsx  # State global + localStorage
│       │   ├── LangContext.tsx
│       │   └── ThemeContext.tsx
│       ├── components/
│       │   ├── Header.tsx
│       │   ├── Footer.tsx     # Trigger admin tersembunyi (10× klik)
│       │   ├── AudioPlayer.tsx
│       │   └── sections/      # HomeSection, AboutSection, dll.
│       └── pages/
│           ├── Portfolio.tsx  # Halaman utama (/)
│           └── Admin.tsx      # Dashboard admin (/x7k9adm2p4q)
├── server/
│   ├── index.ts               # Express server
│   ├── routes.ts              # API routes (contact, admin, analytics)
│   └── storage.ts
├── api/
│   └── index.ts               # Vercel serverless adapter
├── shared/schema.ts
├── .env.example               # Template env vars (salin ke .env)
└── vercel.json
```

---

## ✏️ Cara Edit Konten

### 1. Via Admin Dashboard (Recommended)

Login ke Admin Dashboard → edit semua data secara real-time tanpa restart server.

### 2. Edit Langsung di `client/src/lib/config.ts`

```typescript
export const PORTFOLIO_CONFIG = {
  name: "aka",
  photoUrl: "https://link-foto.com/foto.jpg",
  birthDate: "2009-11-17",       // Format: YYYY-MM-DD
  origin: "Sumatera Barat, Indonesia",
  school: "Nama Sekolah",

  statusTexts: {
    id: ["Murid", "Developer"],  // Teks typing effect (ID)
    en: ["Student", "Developer"] // Teks typing effect (EN)
  },

  aboutDesc: {
    id: "Deskripsi Bahasa Indonesia...",
    en: "English description..."
  },

  social: {
    github: "https://github.com/username",
    instagram: "https://instagram.com/username",
    // telegram, discord, youtube, facebook, email
  },

  projects: [
    {
      id: "1",
      name: "Nama Proyek",
      image: "https://link-gambar.com/img.jpg",
      desc: { id: "Deskripsi ID", en: "Description EN" },
      url: "https://proyek.com",
      buttonType: "view" // "view" atau "group"
    }
  ],

  friends: ["nama1", "nama2"],

  techStack: {
    programming: ["html5", "css3", "js"],
    framework: ["react", "tailwindcss"],
    tools: ["github", "vscode"]
  },

  playlist: [
    { id: "1", title: "Judul Lagu", url: "https://link-mp3.com/song.mp3" }
  ],

  adminPath: "/x7k9adm2p4q" // Path rahasia (bisa diganti)
};
```

---

## ⚙️ Admin Dashboard

### Cara Akses

**Cara 1 — Footer Trick:**  
Klik teks copyright di footer sebanyak **10 kali dalam 4.3 detik** → redirect otomatis.

**Cara 2 — URL Langsung:**  
Buka `/x7k9adm2p4q` di browser.

### Login

Password default: diset via env var `ADMIN_PASSWORD` (lihat `.env.example`).

> **Keamanan:** Autentikasi menggunakan token HMAC-SHA256 stateless yang diverifikasi server-side. Tidak disimpan di database — kompatibel penuh dengan Vercel serverless multi-instance.

### Tab Admin

| Tab | Ikon | Fungsi |
|---|---|---|
| **Analitik** | 📊 | Statistik kunjungan, grafik harian, inbox pesan kontak |
| **Beranda** | 🏠 | Edit nama, foto profil, favicon, teks typing effect |
| **Tentang** | 👤 | Edit tanggal lahir, asal, sekolah, deskripsi (ID+EN) |
| **Tech** | 💻 | Tambah/hapus ikon teknologi (3 kategori) |
| **Proyek** | 💼 | Tambah/edit/hapus proyek + reorder |
| **Teman** | 👥 | Manajemen daftar teman (chip-based add/remove) |
| **Medsos** | 🔗 | Edit URL semua platform media sosial |
| **Audio** | 🎵 | Manajemen playlist + preview audio langsung |
| **Pengaturan** | ⚙️ | Visibility seksi, timeline pendidikan, SEO, ekspor/impor, test email, ganti password |

### Fitur Khusus

- **📧 Test Email** — Kirim email percobaan untuk verifikasi konfigurasi Gmail
- **🔑 Ganti Password** — Dengan password strength meter (Lemah/Sedang/Kuat)
- **📦 Ekspor/Impor JSON** — Backup & restore semua pengaturan
- **🌍 Auto-Translate ID→EN** — Terjemahkan deskripsi otomatis via Google Translate
- **📌 Unsaved Indicator** — Titik kuning pada tab yang memiliki perubahan belum disimpan
- **✅ Mark All Read** — Tandai semua pesan kontak sudah dibaca sekaligus
- **↩️ Reply Email** — Tombol balas langsung buka email client

---

## 🚀 Menjalankan Lokal

```bash
# Clone repo
git clone https://github.com/akaanakbaik/portofoliov2.git
cd portofoliov2

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan nilai yang sesuai

# Jalankan development server
npm run dev
```

Buka `http://localhost:5000` di browser.

---

## 🔧 Environment Variables

Salin `.env.example` ke `.env` lalu isi nilainya:

```env
# Password admin dashboard (default: aka)
ADMIN_PASSWORD=kata-sandi-kamu

# Token secret untuk HMAC — gunakan string acak panjang
SESSION_SECRET=string-acak-sangat-panjang

# Gmail untuk form kontak
EMAIL_USER=email@gmail.com
EMAIL_PASS=app-password-gmail
EMAIL_RECIPIENT=penerima@gmail.com
```

> **Gmail App Password:** Buka Google Account → Security → 2-Step Verification → App Passwords → Generate.

---

## ☁️ Deploy ke Vercel

1. Push kode ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Tambahkan **Environment Variables** di dashboard Vercel:
   - `ADMIN_PASSWORD` — password admin
   - `SESSION_SECRET` — string acak panjang (wajib untuk auth)
   - `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_RECIPIENT` — untuk contact form
4. Klik **Deploy**

> **Penting:** Setelah mengubah `ADMIN_PASSWORD` di Vercel, lakukan **Redeploy** agar perubahan aktif.

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/index" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

---

## 📊 Tech Stack

| Kategori | Library |
|---|---|
| Frontend | React 18, Vite, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Animasi | Framer Motion |
| Routing | Wouter |
| State | React Context + localStorage |
| Icons | Lucide React, tech-stack-icons |
| Backend | Express.js, Node.js |
| Auth | HMAC-SHA256 stateless token |
| Email | Nodemailer (Gmail SMTP) |
| Deploy | Vercel (serverless) |

---

## 🔗 Link

- **Portfolio Live:** [akadev.me](https://akadev.me)
- **GitHub:** [github.com/akaanakbaik](https://github.com/akaanakbaik)

---

## 📝 Lisensi

MIT License — bebas digunakan untuk referensi & pembelajaran.

---

<p align="center">Made with ❤️ by <b>aka</b> — Sumatera Barat, Indonesia 🇮🇩</p>

## Durable backend and SEO upgrade (October 2026)

The original visual layout, projects, social links and music player are retained.
The production site is `https://akaa.dev`, backed by this repository.

- Published portfolio settings, revision history, contact messages, password hashes,
  revoked/expiring admin sessions and rate limits are stored in the private
  `portfolio_private` schema. Local storage is used only for theme/language;
  unpublished preview data and the admin token live in session storage.
- The browser never receives the backend credential. A narrowly scoped RPC gateway
  requires a random 256-bit application token whose SHA256 hash is stored privately.
  The server additionally authenticates every admin action. This avoids granting
  the web app an account-wide service-role key. Do not expose this token as `VITE_*`.
- Passwords use salted scrypt. First successful deployment initializes the hash from
  `ADMIN_PASSWORD` on login; subsequent password changes persist in the database
  and revoke all sessions. Changing the environment alone is not a password reset.
- Saving publishes a version with optimistic concurrency protection. Preview opens
  a private, non-indexable tab. Prior versions can be restored into a draft.
- Contact requests only succeed after database persistence. SMTP delivery is awaited,
  TLS certificates are verified, and failed messages remain available in the inbox.
  Scheduled cron retries queued messages (maximum five attempts; claims use leases).
  SMTP is at-least-once: an interrupted acknowledgement can cause a duplicate email;
  the stable Message-ID helps mail systems identify it.
- Vercel runs `/api/cron/supabase-keepalive` at `0 3 * * 1,4` (Monday/Thursday,
  10:00 WIB). Authorization uses `CRON_SECRET`. The job reads real Supabase data,
  records success/failure, retries email, and cleans expired rate limits/sessions.
  Regular requests do not guarantee exemption from provider pause policies.
- The homepage is rendered into HTML on the server with current published content,
  canonical metadata and a Person/ProfilePage/WebSite graph. The admin and private
  preview have noindex headers. Unknown pages return HTTP 404.
- Search Console through Windsor.ai is read-only: it can report performance but
  cannot submit sitemaps or request indexing. The public sitemap is
  `https://akaa.dev/sitemap.xml`; robots.txt advertises it. Search rankings are
  determined by Google and cannot be guaranteed.

### Development and verification

Use Node 24 (`.nvmrc`). `npm ci`, `npm run check`, `npm run build`, `npm test`,
then `npm audit`. The build generates individually cached SVG icons and bundles
`dist/api.cjs`; `api/server.js` is the stable Vercel CommonJS entry point.
The generated HTML shell is bundled with the API. For production-like local tests,
run `npm start` after setting the server environment from `.env.example`.

The test suite uses isolated in-memory RPC/SMTP fixtures for password changes and
email delivery; it must never change the production password or send test emails.
Real database/browser integration tests must remove their temporary messages and
revoke temporary sessions after completion. Store no credentials in test artifacts.

### Database operations

Apply the checked-in migrations to the intended project. Provision
`portfolio_private.state.backend_token_hash` from a separately generated token and
set that token only on the application host. The same token is shared across
instances. No unrelated application's tables or policies should be changed.
Keep the old analytics RPC grants until the new deployment passes verification;
then apply the final migration restricting legacy RPC access to the backend.

Revision history is for content rollback, not a database backup. Keep migrations
in Git and verify Supabase backups/PITR availability for the project's plan.
Before a destructive change, take and verify a provider-supported backup/export.
Rotate the application token by coordinating the private hash and Vercel secret;
redeploy after changing environment variables. Recheck the cron dashboard and
SMTP verification endpoint after deployment. Never log API response bodies that
contain sessions or private messages.

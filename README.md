# 🌐 Portfolio aka — v2

> Portfolio personal **aka** (Abdul Khaliq Arrasyid), pelajar kelas 10 & developer muda dari Sumatera Barat, Indonesia.

[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://portofoliov2.vercel.app)
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

- **Portfolio Live:** [portofoliov2.vercel.app](https://portofoliov2.vercel.app)
- **GitHub:** [github.com/akaanakbaik](https://github.com/akaanakbaik)

---

## 📝 Lisensi

MIT License — bebas digunakan untuk referensi & pembelajaran.

---

<p align="center">Made with ❤️ by <b>aka</b> — Sumatera Barat, Indonesia 🇮🇩</p>

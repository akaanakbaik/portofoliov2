# 🌐 Portfolio aka — v2

> Portfolio personal **aka** (Abdul Khaliq Arrasyid), pelajar kelas 10 & developer muda dari Sumatera Barat, Indonesia.

[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://portofoliov2.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## ✨ Tentang Portfolio Ini

Portfolio ini adalah single-page application (SPA) dengan desain **premium minimalis**, mendukung:

| Fitur | Detail |
|---|---|
| 🌙 Dark / Light Mode | Toggle otomatis, tersimpan di localStorage |
| 🇮🇩 / 🇬🇧 Bilingual | Bahasa Indonesia & English, auto-switch |
| 🎵 Floating Audio Player | Playlist MP3, persist saat scroll |
| 📱 Fully Responsive | Mobile-first, optimal di semua ukuran layar |
| ⚙️ Admin Dashboard | Panel tersembunyi untuk edit semua konten |
| 📊 Visitor Analytics | Statistik kunjungan realtime |
| 🔍 Professional SEO | Open Graph, Twitter Card, JSON-LD Schema |
| ✉️ Contact Form | Kirim pesan langsung via email (Gmail SMTP) |
| 🚀 Vercel Ready | Deploy sekali klik, zero-config |

---

## 🎨 Tema & Desain

- **Font**: Plus Jakarta Sans (Google Fonts)
- **Palet Warna**: Biru (#3b82f6) → Ungu (#6366f1) dengan variasi gelap/terang
- **Animasi**: Framer Motion — spring, viewport-triggered, stagger
- **Komponen**: shadcn/ui + Tailwind CSS
- **Background**: Radial gradient orbs yang bergerak halus
- **Layout**: Card-based, compact spacing (`py-14`), letter spacing `-0.02em`

---

## 📁 Struktur Proyek

```
portofoliov2/
├── client/                    # Frontend (React + Vite)
│   ├── index.html             # Entry point HTML + SEO meta tags
│   ├── public/                # Asset statis
│   └── src/
│       ├── App.tsx            # Router utama (wouter)
│       ├── main.tsx           # React entry point
│       ├── index.css          # Tailwind + CSS variables (tema)
│       ├── lib/
│       │   ├── config.ts      # ⭐ KONFIGURASI UTAMA portfolio
│       │   ├── PortfolioContext.tsx  # State global + localStorage
│       │   ├── LangContext.tsx       # Context bahasa (ID/EN)
│       │   ├── ThemeContext.tsx      # Context dark/light mode
│       │   └── i18n/                # File terjemahan
│       ├── components/
│       │   ├── Header.tsx     # Navbar fixed + toggle tema & bahasa
│       │   ├── Sidebar.tsx    # Navigasi slide-in
│       │   ├── Footer.tsx     # Footer + trigger admin rahasia
│       │   ├── AudioPlayer.tsx # Player musik floating
│       │   └── sections/
│       │       ├── HomeSection.tsx      # Hero (foto, nama, typing effect)
│       │       ├── AboutSection.tsx     # Kartu info + deskripsi
│       │       ├── TimelineSection.tsx  # Riwayat pendidikan
│       │       ├── StackSection.tsx     # Tech stack dengan ikon
│       │       ├── ProjectsSection.tsx  # Kartu proyek scroll horizontal
│       │       ├── FriendsSection.tsx   # Marquee teman
│       │       ├── SocialSection.tsx    # Grid sosial media
│       │       └── ContactSection.tsx   # Form kontak
│       └── pages/
│           ├── Portfolio.tsx  # Halaman utama (/ route)
│           └── Admin.tsx      # Dashboard admin (/x7k9adm2p4q)
├── server/
│   ├── index.ts               # Express server entry
│   ├── routes.ts              # API routes (contact, translate, analytics)
│   └── storage.ts             # Interface penyimpanan
├── api/
│   └── index.ts               # Vercel serverless handler
├── shared/
│   └── schema.ts              # Tipe data bersama
├── vercel.json                # Konfigurasi Vercel deployment
└── README.md                  # File ini
```

---

## ✏️ Cara Edit Manual (Kode)

### 1. Edit Data Utama — `client/src/lib/config.ts`

File ini adalah **sumber kebenaran** untuk semua data portfolio. Edit langsung:

```typescript
export const PORTFOLIO_CONFIG = {
  name: "aka",                          // Nama yang tampil di header & hero
  photoUrl: "https://...",              // URL foto profil (gunakan link langsung)
  birthDate: "2009-11-17",             // Format: YYYY-MM-DD (untuk hitung umur otomatis)
  origin: "Sumatera Barat, Indonesia", // Asal/kota
  school: "SMAN 1 Lembah Melintang",  // Sekolah saat ini

  statusTexts: {
    id: ["Murid", "Developer", "Pemula"], // Teks typing effect (bahasa Indonesia)
    en: ["Student", "Developer", "Beginner"] // Teks typing effect (English)
  },

  aboutDesc: {
    id: "Deskripsi dalam bahasa Indonesia...",
    en: "Description in English..."
  },

  social: {
    github: "https://github.com/...",
    instagram: "https://instagram.com/...",
    // ... tambah/hapus sesuai kebutuhan
  },

  projects: [
    {
      id: "1",
      name: "Nama Proyek",
      image: "https://link-gambar.com/img.jpg",
      desc: { id: "Deskripsi ID", en: "Description EN" },
      url: "https://proyek.com",
      buttonType: "view" // "view" atau "group" (untuk grup WhatsApp)
    }
  ],

  friends: ["nama1", "nama2"],     // Daftar teman (tampil di marquee)

  techStack: {
    programming: ["html5", "css3", "js"],    // Nama ikon dari tech-stack-icons
    framework: ["react", "tailwindcss"],
    tools: ["github", "vscode"]
  },

  playlist: [
    { id: "1", title: "Judul Lagu", url: "https://link-mp3.com/song.mp3" }
  ],

  adminPath: "/x7k9adm2p4q"  // Path rahasia admin (bisa diganti)
};
```

### 2. Edit Terjemahan — `client/src/lib/i18n/`

File `id.json` dan `en.json` berisi semua teks UI:

```json
// id.json contoh
{
  "nav": { "home": "Beranda", "about": "Tentang" },
  "about": { "title": "Tentang Saya" },
  "contact": { "send": "Kirim Pesan" }
}
```

### 3. Edit Tampilan — `client/src/index.css`

Ubah palet warna dengan edit variabel CSS:

```css
:root {
  --background: 220 15% 97%;  /* Background terang */
  --foreground: 220 25% 10%;  /* Teks utama */
  /* dst... */
}
.dark {
  --background: 225 15% 7%;   /* Background gelap */
  --foreground: 210 20% 92%;
}
```

### 4. Ganti Password Admin

**Cara 1 (Recommended):** Login ke Admin Dashboard → tab **Pengaturan** → kartu **Ganti Password Admin**. Masukkan password baru dan simpan. Password tersimpan di localStorage browser.

**Cara 2 (Reset ke default):** Password default adalah `akaa`. Jika kamu lupa password yang sudah diganti, hapus key `aka-admin-pw` dari localStorage browser untuk kembali ke default.

**Cara 3 (Permanen via kode):** Buka `client/src/pages/Admin.tsx`, cari `getAdminPassword` dan edit:

```typescript
const getAdminPassword = () => {
  return localStorage.getItem("aka-admin-pw") || "password_baru_kamu_di_sini";
};
```

### 5. Ganti Path Admin Rahasia

Di `client/src/lib/config.ts`:

```typescript
adminPath: "/x7k9adm2p4q"  // Ganti dengan path yang kamu inginkan
```

---

## ⚙️ Admin Dashboard

### Cara Mengakses

Admin tersembunyi dari publik. Ada **dua cara** masuk:

**Cara 1 — Klik Tersembunyi:**
> Klik teks **"© 2026 Aka"** di footer sebanyak **10 kali** dalam 4.3 detik → akan redirect otomatis ke admin.

**Cara 2 — URL Langsung:**
> Buka `/x7k9adm2p4q` di browser (path ini bisa diubah di `config.ts`).

### Login
Password default: **`akaa`**

### Tab-Tab Admin

| Tab | Ikon | Fungsi |
|---|---|---|
| **Analitik** | 📊 | Statistik kunjungan, grafik harian, analisis bahasa kode |
| **Beranda** | 🏠 | Edit nama, foto profil, **favicon**, teks typing effect |
| **Tentang** | 👤 | Edit tanggal lahir, asal, sekolah, deskripsi (ID+EN + auto-translate) |
| **Tech Stack** | 💻 | Tambah/hapus ikon teknologi dari 3 kategori |
| **Proyek** | 💼 | Tambah/edit/hapus proyek dengan deskripsi bilingual |
| **Teman** | 👥 | Edit daftar teman yang muncul di marquee |
| **Medsos** | 🔗 | Edit URL semua platform media sosial |
| **Audio** | 🎵 | Tambah/hapus lagu dari playlist dengan preview audio |
| **Pengaturan** | ⚙️ | Visibility seksi, editor pendidikan, SEO, ekspor/impor, reset |

### Fitur Pengaturan (Tab ⚙️)

- **Visibilitas Seksi** — Tampilkan/sembunyikan bagian portfolio (Tentang, Timeline, Tech, dll)
- **Editor Pendidikan** — Edit nama sekolah & tahun untuk timeline SD/MTs/SMA
- **SEO Settings** — Edit judul halaman, meta deskripsi, teks footer
- **Ekspor/Impor JSON** — Backup semua pengaturan ke file JSON, atau restore dari file
- **Reset ke Default** — Kembalikan semua ke nilai bawaan (double-confirm)
- **Jam Langsung** — Menampilkan waktu & tanggal Indonesia saat ini
- **Quick Actions** — Buka situs di tab baru, salin URL portfolio

### Auto-Translate
Di tab **Beranda**, **Tentang**, dan **Proyek** ada tombol **ID→EN** yang secara otomatis menerjemahkan teks dari Bahasa Indonesia ke Inggris menggunakan Google Translate API.

---

## 🚀 Cara Menjalankan Lokal

### Prerequisites
- Node.js 18+
- npm atau pnpm

### Install & Run

```bash
# Clone repo
git clone https://github.com/akaanakbaik/portofoliov2.git
cd portofoliov2

# Install dependencies
npm install

# Buat file .env
cp .env.example .env
# Edit .env dengan kredensial kamu

# Jalankan development server
npm run dev
```

Buka `http://localhost:5000` di browser.

### Environment Variables

```env
# Email untuk form kontak (Gmail)
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your-app-password      # Gmail App Password (bukan password biasa)
EMAIL_RECIPIENT=recipient@gmail.com

# Session secret
SESSION_SECRET=random-secret-string
```

> **Cara Buat Gmail App Password:**
> Buka Gmail → Keamanan → Verifikasi 2 Langkah → App Passwords → Generate

---

## ☁️ Deploy ke Vercel

1. Push kode ke GitHub
2. Buka [vercel.com](https://vercel.com) → **Import Project** dari GitHub
3. Pilih repo `portofoliov2`
4. Tambahkan **Environment Variables** di Vercel:
   - `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_RECIPIENT`, `SESSION_SECRET`
5. Klik **Deploy** → otomatis build & live!

**Vercel Config** (`vercel.json`):
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

## 📊 Statistik Pemrograman

| Bahasa | Penggunaan |
|---|---|
| TypeScript (.tsx/.ts) | ~85% |
| CSS | ~8% |
| JSON | ~4% |
| HTML | ~2% |
| JavaScript | ~1% |

### Library & Framework Utama

| Kategori | Library |
|---|---|
| Frontend | React 18, Vite, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Animasi | Framer Motion |
| Routing | Wouter |
| State | React Context + localStorage |
| Icons | Lucide React, React Icons, tech-stack-icons |
| Backend | Express.js, Node.js |
| Email | Nodemailer (Gmail SMTP) |
| Deploy | Vercel (serverless) |

---

## 🔗 Link

- **Portfolio Live:** [portofoliov2.vercel.app](https://portofoliov2.vercel.app)
- **GitHub:** [github.com/akaanakbaik](https://github.com/akaanakbaik)
- **Instagram:** [@kenal.aka](https://instagram.com/kenal.aka)

---

## 📝 Lisensi

MIT License — bebas digunakan untuk referensi & pembelajaran. Jika kamu fork/gunakan, sertakan credit ya 🙏

---

<p align="center">Made with ❤️ by <b>aka</b> — Sumatera Barat, Indonesia 🇮🇩</p>

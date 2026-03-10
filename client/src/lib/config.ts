export const PORTFOLIO_CONFIG = {
  name: "aka",
  photoUrl: "https://raw.githubusercontent.com/akaanakbaik/my-cdn/main/portofolio/aka.jpg",
  birthDate: "2009-11-17",
  origin: "Sumatera Barat, Indonesia",
  school: "SMAN 1 Lembah Melintang",
  statusTexts: {
    id: ["Murid", "Developer", "Pemula"],
    en: ["Student", "Developer", "Beginner"]
  },
  aboutDesc: {
    id: "Hai semua, nama ku aka, saya tinggal di Sumatra Barat, Indonesia. saya kelas 10 sekarang dan berumur 16 tahun, saya suka hal-hal berbau teknologi, pengetahuan alam, pemograman dan sebagainya. saya haus akan keingintahuan akan ilmu dan pengalaman. terimakasih :)",
    en: "Hey everyone, my name is Aka. I live in West Sumatra, Indonesia. I'm in 10th grade now and 16 years old. I love technology, natural science, programming, and so on. I'm thirsty for knowledge and new experiences. Thank you :)"
  },
  social: {
    instagram: "https://instagram.com/kenal.aka",
    facebook: "https://www.facebook.com/share/1Du3eA6rDY/",
    github: "https://github.com/akaanakbaik",
    youtube: "https://www.youtube.com/@always-aka",
    telegram: "https://t.me/akamodebaik",
    discord: "https://discord.com/akaanakbaik",
    email: "mailto:khaliqarrasyidabdul@gmail.com"
  },
  projects: [
    {
      id: "1",
      name: "Portofolio Pertama",
      image: "https://raw.githubusercontent.com/akaanakbaik/my-cdn/main/portofolio/portofolio%20pertama.jpg",
      desc: {
        id: "Web portofolio pertama yang ku buat dengan eyae",
        en: "My first portfolio website built with eyae"
      },
      url: "https://akadev.me",
      buttonType: "view"
    },
    {
      id: "2",
      name: "Web Tools",
      image: "https://raw.githubusercontent.com/akaanakbaik/my-cdn/main/portofolio/kaai.jpg",
      desc: {
        id: "Website yang isinya ada ytdl, aichat, aio dan ssweb",
        en: "Website containing ytdl, aichat, aio and ssweb tools"
      },
      url: "https://kaai.my.id",
      buttonType: "view"
    },
    {
      id: "3",
      name: "Domku",
      image: "https://raw.githubusercontent.com/akaanakbaik/my-cdn/main/portofolio/domku.jpg",
      desc: {
        id: "Web create subdomain gratis",
        en: "Free subdomain creator website"
      },
      url: "https://domku.my.id",
      buttonType: "view"
    },
    {
      id: "4",
      name: "Kabox",
      image: "https://raw.githubusercontent.com/akaanakbaik/my-cdn/main/portofolio/kabox.jpg",
      desc: {
        id: "Web uploader atau CDN gratis",
        en: "Free file uploader or CDN website"
      },
      url: "https://kabox.my.id",
      buttonType: "view"
    },
    {
      id: "5",
      name: "Bot WA FurinaAI",
      image: "https://raw.githubusercontent.com/akaanakbaik/my-cdn/main/portofolio/botfurina.jpg",
      desc: {
        id: "Bot WA FurinaAI menggunakan JS ESM, silahkan gabung grup jika ingin menggunakannya",
        en: "FurinaAI WhatsApp bot using JS ESM, join the group to use it"
      },
      url: "https://chat.whatsapp.com/IQNuMGxN7Y3HLSwLDIXkGA?mode=hqctcla",
      buttonType: "group"
    },
    {
      id: "6",
      name: "Profile Card",
      image: "https://raw.githubusercontent.com/akaanakbaik/my-cdn/main/portofolio/profilecard.jpg",
      desc: {
        id: "Web profilecard, web pertama tapi template sih 🗿",
        en: "Profile card website, my first web but it's a template 🗿"
      },
      url: "https://profile-card-simpel-git-main-akas-projects-128b7fd7.vercel.app/",
      buttonType: "view"
    }
  ],
  friends: ["habibi", "youso", "hydra", "kyzz", "adit", "indra", "juul", "udin", "royy", "aldy", "junz", "fakhrul", "raol"],
  techStack: {
    programming: ["html5", "css3", "js", "typescript", "python", "php", "go"],
    framework: ["vitejs", "react", "tailwindcss", "bootstrap5", "nextjs", "threejs", "nodejs", "expressjs"],
    tools: ["vscode", "antigravity", "github", "supabase", "appwrite", "postgresql", "mysql", "anthropic", "groq", "grok", "pterodactyl", "deepseek", "nvidia", "kimi", "bash", "bunjs", "npm", "chrome", "edge", "docker", "flutter", "gemini", "google", "ubuntu", "linux", "neon", "mongodb", "openai", "v0", "vercel", "n8n"]
  },
  playlist: [
    {
      id: "1",
      title: "8 Laters",
      url: "https://raw.githubusercontent.com/akaanakbaik/my-cdn/main/portofolio/8laters.mp3"
    },
    {
      id: "2",
      title: "Tumblr Girl",
      url: "https://raw.githubusercontent.com/akaanakbaik/my-cdn/main/portofolio/original%20sound%20-%20chllxedits_musicaldown.com_1773034019.mp3"
    },
    {
      id: "3",
      title: "Hayya Hayya FIFA World Cup 2022",
      url: "https://raw.githubusercontent.com/akaanakbaik/my-cdn/main/portofolio/tes-hayya-hayya.mp3"
    }
  ],
  adminPath: "/x7k9adm2p4q",
  pterodactylLogoUrl: "https://raw.githubusercontent.com/akaanakbaik/my-cdn/main/portofolio/download.png"
};

export function calculateAge(birthDateStr: string): number {
  const today = new Date();
  const birth = new Date(birthDateStr);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

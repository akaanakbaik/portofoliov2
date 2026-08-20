export type SchoolLevel = "sd" | "mts" | "sma";

const schoolAssets: Record<SchoolLevel, string> = {
  sd: "/assets/schools/sdn13-lembah-melintang.jpg",
  mts: "/assets/schools/mtsn2-pasaman.jpg",
  sma: "/assets/schools/sman1-lembah-melintang.png"
};

export function SchoolLogo({ level, alt, className = "" }: { level: SchoolLevel; alt: string; className?: string }) {
  return <img src={schoolAssets[level]} alt={alt} loading="lazy" decoding="async" className={`object-contain ${className}`} />;
}

import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  AtSign,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CalendarCheck2,
  CalendarDays,
  CalendarRange,
  Cake,
  Check,
  CheckCircle2,
  CircleCheck,
  CircleX,
  ClipboardList,
  CloudDownload,
  CloudUpload,
  Code2,
  Copy,
  Eye,
  FileText,
  Github,
  GraduationCap,
  Heart,
  Home,
  Inbox,
  Info,
  Instagram,
  KeyRound,
  Landmark,
  Laptop2,
  Lightbulb,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Music2,
  Package,
  PenLine,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  School,
  Trash2,
  Upload,
  UserRound,
  UsersRound,
  Wrench,
  X,
  Youtube,
  Zap,
  type LucideIcon
} from "lucide-react";
import type { SVGProps } from "react";

export type SvgIconName =
  | "activity"
  | "alert"
  | "analytics"
  | "arrow-down"
  | "arrow-up"
  | "at"
  | "book"
  | "briefcase"
  | "calendar"
  | "calendar-check"
  | "calendar-range"
  | "cake"
  | "check"
  | "check-circle"
  | "circle-check"
  | "circle-x"
  | "clipboard"
  | "code"
  | "copy"
  | "download"
  | "eye"
  | "file"
  | "github"
  | "graduation"
  | "heart"
  | "home"
  | "inbox"
  | "info"
  | "instagram"
  | "key"
  | "landmark"
  | "laptop"
  | "lightbulb"
  | "link"
  | "mail"
  | "map-pin"
  | "message"
  | "music"
  | "package"
  | "pen"
  | "plus"
  | "refresh"
  | "reset"
  | "search"
  | "send"
  | "settings"
  | "shield"
  | "school"
  | "trash"
  | "upload"
  | "user"
  | "users"
  | "wrench"
  | "x"
  | "youtube"
  | "zap";

const iconMap: Record<SvgIconName, LucideIcon> = {
  activity: Activity,
  alert: AlertTriangle,
  analytics: BarChart3,
  "arrow-down": ArrowDown,
  "arrow-up": ArrowUp,
  at: AtSign,
  book: BookOpen,
  briefcase: BriefcaseBusiness,
  calendar: CalendarDays,
  "calendar-check": CalendarCheck2,
  "calendar-range": CalendarRange,
  cake: Cake,
  check: Check,
  "check-circle": CheckCircle2,
  "circle-check": CircleCheck,
  "circle-x": CircleX,
  clipboard: ClipboardList,
  code: Code2,
  copy: Copy,
  download: CloudDownload,
  eye: Eye,
  file: FileText,
  github: Github,
  graduation: GraduationCap,
  heart: Heart,
  home: Home,
  inbox: Inbox,
  info: Info,
  instagram: Instagram,
  key: KeyRound,
  landmark: Landmark,
  laptop: Laptop2,
  lightbulb: Lightbulb,
  link: Link2,
  mail: Mail,
  "map-pin": MapPin,
  message: MessageCircle,
  music: Music2,
  package: Package,
  pen: PenLine,
  plus: Plus,
  refresh: RefreshCw,
  reset: RotateCcw,
  search: Search,
  send: Send,
  settings: Settings2,
  shield: ShieldCheck,
  school: School,
  trash: Trash2,
  upload: Upload,
  user: UserRound,
  users: UsersRound,
  wrench: Wrench,
  x: X,
  youtube: Youtube,
  zap: Zap
};

export function SvgIcon({ name, label, size = 16, strokeWidth = 1.8, className, ...props }: { name: SvgIconName; label?: string; size?: number | string; strokeWidth?: number; className?: string } & Omit<SVGProps<SVGSVGElement>, "name">) {
  const Icon = iconMap[name];
  return <Icon aria-hidden={label ? undefined : true} aria-label={label} role={label ? "img" : undefined} size={size} strokeWidth={strokeWidth} className={className} {...props} />;
}

export function EducationMark({ level, label, className }: { level: "sd" | "mts" | "sma"; label?: string; className?: string }) {
  const colors = {
    sd: { fill: "#10b981", accent: "#d1fae5", stroke: "#047857" },
    mts: { fill: "#15803d", accent: "#dcfce7", stroke: "#166534" },
    sma: { fill: "#2563eb", accent: "#dbeafe", stroke: "#1d4ed8" }
  }[level];

  return (
    <svg viewBox="0 0 48 48" width="48" height="48" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={className} fill="none">
      <path d="M24 3 43 10v13c0 11.2-7.7 18.8-19 22C12.7 41.8 5 34.2 5 23V10L24 3Z" fill={colors.fill} stroke={colors.stroke} strokeWidth="1.5" />
      {level === "sd" && <><path d="m13 23 11-7 11 7-11 7-11-7Z" fill={colors.accent} stroke="white" strokeWidth="1.4" /><path d="M17 26v6h14v-6" stroke="white" strokeWidth="1.4" strokeLinecap="round" /><path d="M35 24v7" stroke="white" strokeWidth="1.4" strokeLinecap="round" /></>}
      {level === "mts" && <><path d="M24 12c1.8 2.4 4.2 3.9 7.3 4.6-2.2 2-3.5 4.4-3.8 7.4-1.2-1.4-2.4-2.1-3.5-2.1s-2.3.7-3.5 2.1c-.3-3-1.6-5.4-3.8-7.4 3.1-.7 5.5-2.2 7.3-4.6Z" fill={colors.accent} /><path d="M14 30h20M17 34h14" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></>}
      {level === "sma" && <><path d="M14 18h20v15H14z" fill={colors.accent} stroke="white" strokeWidth="1.4" /><path d="M18 23h12M18 27h8" stroke={colors.stroke} strokeWidth="1.5" strokeLinecap="round" /><path d="m24 10 1.3 2.6 2.9.4-2.1 2 .5 2.8-2.6-1.3-2.6 1.3.5-2.8-2.1-2 2.9-.4L24 10Z" fill="#facc15" /></>}
    </svg>
  );
}

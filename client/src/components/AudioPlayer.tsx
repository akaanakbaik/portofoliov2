import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortfolio } from "@/lib/PortfolioContext";

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16"/>
      <rect x="14" y="4" width="4" height="16"/>
    </svg>
  );
}
function PrevIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="19 20 9 12 19 4 19 20"/>
      <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function NextIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 4 15 12 5 20 5 4"/>
      <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function MinimizeIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="4 14 10 14 10 20"/>
      <polyline points="20 10 14 10 14 4"/>
      <line x1="10" y1="14" x2="3" y2="21"/>
      <line x1="21" y1="3" x2="14" y2="10"/>
    </svg>
  );
}
function ExpandIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="15 3 21 3 21 9"/>
      <polyline points="9 21 3 21 3 15"/>
      <line x1="21" y1="3" x2="14" y2="10"/>
      <line x1="3" y1="21" x2="10" y2="14"/>
    </svg>
  );
}
function VolumeIcon({ muted }: { muted: boolean }) {
  return muted ? (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
    </svg>
  ) : (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  );
}
function MusicNoteIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg>
  );
}

function formatTime(sec: number) {
  if (!isFinite(sec) || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioPlayer() {
  const { settings } = usePortfolio();
  const playlist = settings.playlist;

  const [showUI, setShowUI] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const track = playlist[currentIndex];

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = 0.7;
    }
    const audio = audioRef.current;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onLoaded = () => setDuration(audio.duration);
    const onEnded = () => setCurrentIndex(i => (i + 1) % playlist.length);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [playlist.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    const wasPlaying = isPlaying;
    audio.src = track.url;
    audio.load();
    if (wasPlaying) audio.play().catch(() => {});
  }, [currentIndex, track?.url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
  }, [volume, muted]);

  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
      setTimeout(() => setShowUI(false), 300);
    }, 3000);
  }, []);

  const handleInteraction = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setShowUI(true);
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => {
    scheduleHide();
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  const prev = () => {
    setCurrentIndex(i => (i - 1 + playlist.length) % playlist.length);
  };

  const next = () => {
    setCurrentIndex(i => (i + 1) % playlist.length);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
  };

  const titleIsLong = track && track.title.length > 16;

  if (!track) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] select-none">
      <AnimatePresence mode="wait">
        {!showUI ? (
          <motion.button
            key="mini"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => {
              setShowUI(true);
              scheduleHide();
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(8,8,14,0.92)",
              border: "1px solid rgba(59,130,246,0.35)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.45)"
            }}
            data-testid="audio-show"
          >
            <span className="text-blue-400"><MusicNoteIcon /></span>
          </motion.button>
        ) : (
          <motion.div
            key="player"
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.92 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={handleInteraction}
            onTouchStart={handleInteraction}
            data-testid="audio-player"
          >
            <motion.div
              layout
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(7,7,13,0.96)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.65), 0 2px 8px rgba(0,0,0,0.4)",
                backdropFilter: "blur(28px)",
                WebkitBackdropFilter: "blur(28px)"
              }}
            >
              <div className="px-3 py-2.5 flex items-center gap-2.5" style={{ minWidth: 224 }}>
                <motion.div
                  animate={isPlaying ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(59,130,246,0.22)", border: "1px solid rgba(59,130,246,0.28)" }}
                >
                  <span className="text-blue-400"><MusicNoteIcon /></span>
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="overflow-hidden" style={{ width: 104 }}>
                    {titleIsLong ? (
                      <div style={{ maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)" }}>
                        <motion.div
                          animate={{ x: ["0%", "-50%"] }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          className="flex whitespace-nowrap gap-8"
                        >
                          <span className="text-[11px] font-semibold text-white/88">{track.title}</span>
                          <span className="text-[11px] font-semibold text-white/88">{track.title}</span>
                        </motion.div>
                      </div>
                    ) : (
                      <span className="text-[11px] font-semibold text-white/88 truncate block">{track.title}</span>
                    )}
                  </div>

                  <div
                    className="mt-1.5 w-full h-0.5 rounded-full cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                    onClick={seek}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ width: `${progress}%`, background: "linear-gradient(to right, #3b82f6, #60a5fa)" }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={togglePlay}
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "hsl(217 91% 58%)" }}
                  data-testid="audio-play-pause"
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isPlaying ? "pause" : "play"}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ duration: 0.14 }}
                      className="text-white"
                    >
                      {isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => {
                    setIsExpanded(v => !v);
                    handleInteraction();
                  }}
                  className="w-5 h-5 flex items-center justify-center transition-colors flex-shrink-0"
                  style={{ color: "rgba(255,255,255,0.38)" }}
                  data-testid="audio-expand"
                >
                  {isExpanded ? <MinimizeIcon /> : <ExpandIcon />}
                </motion.button>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3.5 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="pt-2.5 flex items-center justify-between text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>

                      <div
                        className="w-full h-1 rounded-full cursor-pointer group relative"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                        onClick={seek}
                      >
                        <div
                          className="h-full rounded-full relative"
                          style={{ width: `${progress}%`, background: "linear-gradient(to right, #3b82f6, #60a5fa)", transition: "width 0.1s linear" }}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <motion.button whileTap={{ scale: 0.82 }} onClick={prev} className="transition-colors" style={{ color: "rgba(255,255,255,0.45)" }} data-testid="audio-prev"><PrevIcon /></motion.button>
                          <motion.button whileTap={{ scale: 0.82 }} onClick={next} className="transition-colors" style={{ color: "rgba(255,255,255,0.45)" }} data-testid="audio-next"><NextIcon /></motion.button>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button whileTap={{ scale: 0.82 }} onClick={() => setMuted(m => !m)} className="transition-colors" style={{ color: "rgba(255,255,255,0.38)" }}>
                            <VolumeIcon muted={muted} />
                          </motion.button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={muted ? 0 : volume}
                            onChange={e => {
                              const v = parseFloat(e.target.value);
                              setVolume(v);
                              setMuted(v === 0);
                            }}
                            className="w-16 h-0.5 accent-blue-400 cursor-pointer"
                            style={{ appearance: "auto" }}
                            data-testid="audio-volume"
                          />
                        </div>
                      </div>

                      <div className="flex gap-1 pt-0.5">
                        {playlist.map((item, i) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setCurrentIndex(i);
                              if (audioRef.current) audioRef.current.play().catch(() => {});
                            }}
                            className="flex-1 text-[9px] rounded py-0.5 transition-all px-1 truncate"
                            style={{
                              background: i === currentIndex ? "rgba(59,130,246,0.18)" : "transparent",
                              color: i === currentIndex ? "#60a5fa" : "rgba(255,255,255,0.28)",
                              fontWeight: i === currentIndex ? 600 : 400
                            }}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

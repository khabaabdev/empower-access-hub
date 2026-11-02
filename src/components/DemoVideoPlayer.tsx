import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle, Globe, Play, Playlist, SpeakerSimpleX, VideoCamera, Waveform } from "@phosphor-icons/react";
import {
  DEMO_CAPTIONS,
  DEMO_CHARACTERS,
  DEMO_CHAPTERS,
  DEMO_DURATION,
  DEMO_IMAGES,
  DEMO_LANGUAGES,
  DEMO_TRANSCRIPT,
  DEMO_VIDEO_FALLBACK,
  DEMO_VIDEO_URL,
  speakMultilingual,
} from "../data/mockData";
import DemoChaptersPanel from "./DemoChaptersPanel";
import DemoPlayerToolbar from "./DemoPlayerToolbar";

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const BAR_COUNT = 18;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

export default function DemoVideoPlayer() {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(DEMO_DURATION);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [lang, setLang] = useState("en-US");
  const [mode, setMode] = useState<"video" | "stage">("video");
  const [error, setError] = useState<string | null>(null);
  const [bars, setBars] = useState<number[]>(() => new Array(BAR_COUNT).fill(0.12));
  const reduced = useReducedMotion();

  // chapter + transcript timings follow the real clip length so markers always line up
  const scale = duration > 0 ? duration / DEMO_DURATION : 1;
  const chapters = useMemo(
    () =>
      DEMO_CHAPTERS.map((c) => ({
        ...c,
        start: c.start * scale,
        end: c.end * scale,
        time: formatTime(c.start * scale),
      })),
    [scale],
  );
  const transcript = useMemo(
    () => DEMO_TRANSCRIPT.map((line) => ({ ...line, at: line.at * scale, time: formatTime(line.at * scale) })),
    [scale],
  );

  const chapterIndex = useMemo(() => {
    const i = chapters.findIndex((c) => time >= c.start && time < c.end);
    return i === -1 ? chapters.length - 1 : i;
  }, [time, chapters]);
  const chapter = chapters[chapterIndex] ?? chapters[0];
  const activeCharacter = DEMO_CHARACTERS.find((c) => c.id === chapter.characterId);

  const captions = DEMO_CAPTIONS[lang] ?? DEMO_CAPTIONS["en-US"];
  const caption = captions[chapterIndex] ?? chapter.caption;
  const still = DEMO_IMAGES[chapter.id] ?? "";
  const activeLang = DEMO_LANGUAGES.find((l) => l.code === lang) ?? DEMO_LANGUAGES[0];
  const progress = duration > 0 ? Math.min(100, (time / duration) * 100) : 0;

  const activeLine = useMemo(() => {
    let found = transcript[0];
    for (const line of transcript) if (time >= line.at) found = line;
    return found;
  }, [time, transcript]);

  const fail = useCallback((message: string) => {
    setError(message);
    toast.error(message);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      const attempt = v.play();
      if (attempt && typeof attempt.then === "function") {
        attempt
          .then(() => setError(null))
          .catch(() => fail("The video could not start. Check your connection and press retry."));
      }
    } else {
      v.pause();
    }
  }, [fail]);

  const seek = useCallback(
    (to: number) => {
      const v = videoRef.current;
      const next = Math.min(Math.max(0, to), duration || DEMO_DURATION);
      setTime(next);
      if (v) {
        try {
          v.currentTime = next;
        } catch {
          /* seeking before metadata is ready is harmless */
        }
      }
    },
    [duration],
  );

  const cycleSpeed = () => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length]);

  useEffect(() => {
    const v = videoRef.current;
    if (v) v.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = volume;
    v.muted = muted;
  }, [volume, muted]);

  // subtle equalizer pulse while the clip is running
  useEffect(() => {
    if (!playing) {
      setBars(new Array(BAR_COUNT).fill(0.12));
      return;
    }
    const id = window.setInterval(() => {
      setBars((prev) =>
        prev.map((_, i) => 0.12 + (Math.sin(Date.now() / 220 + i * 0.7) * 0.5 + 0.5) * 0.82),
      );
    }, 180);
    return () => window.clearInterval(id);
  }, [playing]);

  const enterFullscreen = () => {
    const node = shellRef.current;
    if (!node) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void node.requestFullscreen?.();
  };

  const enterPip = async () => {
    const v = videoRef.current;
    if (!v || !document.pictureInPictureEnabled) {
      toast.error("Picture-in-picture is not available in this browser.");
      return;
    }
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await v.requestPictureInPicture();
    } catch {
      toast.error("Picture-in-picture could not be opened.");
    }
  };

  const readChapter = () => {
    if (!speakMultilingual(chapter.narration, lang)) toast.error("This browser cannot read text aloud.");
  };

  const retry = () => {
    setError(null);
    const v = videoRef.current;
    if (!v) return;
    v.load();
    void v.play().catch(() => setError("The demo video is still unavailable. Try the guided stage."));
  };

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <div className="card-a11y overflow-hidden">
        <div ref={shellRef} className="relative aspect-video overflow-hidden bg-black">
          <video
            ref={videoRef}
            poster={DEMO_IMAGES.problem}
            preload="metadata"
            playsInline
            aria-label="OpenAccess Hub product demo video"
            className="absolute inset-0 h-full w-full object-cover"
            onLoadedMetadata={(e) => {
              const d = e.currentTarget.duration;
              if (Number.isFinite(d) && d > 0) setDuration(d);
              e.currentTarget.playbackRate = speed;
            }}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            onPlay={() => {
              setPlaying(true);
              setError(null);
            }}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onError={() => fail("The demo video failed to load. Check your connection and press retry.")}
          >
            <source src={DEMO_VIDEO_URL} type="video/mp4" />
            <source src={DEMO_VIDEO_FALLBACK} type="video/mp4" />
            Your browser does not support embedded video. You can still use the guided stage.
          </video>

          {/* equalizer badge */}
          <div className="pointer-events-none absolute right-3 top-3 flex items-end gap-[3px] rounded-lg bg-black/45 px-2 py-1.5 backdrop-blur-sm">
            <Waveform
              size={13}
              weight="fill"
              aria-hidden="true"
              className={`mb-0.5 mr-0.5 ${playing ? "text-accent-app" : "text-white/50"}`}
            />
            {bars.map((v, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="w-[3px] rounded-full bg-white/80"
                style={{ height: `${Math.round(3 + v * 15)}px`, transition: "height 120ms linear" }}
              />
            ))}
          </div>

          {/* guided stage overlay */}
          <AnimatePresence>
            {mode === "stage" ? (
              <motion.div
                key="stage"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <AnimatePresence mode="sync">
                  <motion.img
                    key={chapter.id}
                    src={still}
                    alt={`${chapter.title} still`}
                    initial={{ opacity: 0, scale: reduced ? 1 : 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.6, ease: "easeOut" }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={chapter.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute inset-0 flex flex-col justify-center p-5 sm:p-8"
                  >
                    {activeCharacter ? (
                      <div className="mb-3 flex items-center gap-2">
                        <span className="text-2xl" aria-hidden="true">{activeCharacter.avatar}</span>
                        <div>
                          <p className="text-white text-sm font-extrabold">{activeCharacter.name}</p>
                          <p className="text-white/70 text-[11px] font-semibold">{activeCharacter.role}</p>
                        </div>
                      </div>
                    ) : null}
                    <p className="text-accent-app text-[11px] font-extrabold uppercase tracking-wider drop-shadow">
                      {chapter.time} &middot; {chapter.title}
                    </p>
                    <h3 className="mt-1 text-xl font-extrabold leading-tight text-white drop-shadow sm:text-2xl">
                      {chapter.title}
                    </h3>
                    <ul className="mt-4 space-y-2.5">
                      {chapter.scene.map((line, i) => (
                        <motion.li
                          key={line}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.12 + i * 0.16, duration: 0.32, ease: "easeOut" }}
                          className="flex items-start gap-2"
                        >
                          <CheckCircle
                            size={18}
                            weight="bold"
                            aria-hidden="true"
                            className="text-accent-app mt-0.5 shrink-0"
                          />
                          <span className="text-sm font-semibold leading-snug text-white drop-shadow sm:text-base">
                            {line}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* captions */}
          {captionsOn ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3" dir={lang === "ar-SA" ? "rtl" : "ltr"}>
              <p className="mx-auto max-w-lg rounded-lg bg-black/80 px-3 py-1.5 text-center text-xs font-bold leading-snug text-white sm:text-sm">
                <span className="text-accent-app mr-1.5 font-extrabold uppercase">
                  {activeLang.code.split("-")[0]}
                </span>
                {caption}
              </p>
            </div>
          ) : null}

          {/* error state */}
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/85 p-6 text-center">
              <SpeakerSimpleX size={28} weight="bold" aria-hidden="true" className="text-accent-app" />
              <p className="max-w-sm text-sm font-bold text-white">{error}</p>
              <button
                type="button"
                onClick={retry}
                className="bg-accent-app min-h-11 rounded-xl px-4 text-sm font-extrabold"
              >
                Retry video
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("stage");
                  setError(null);
                }}
                className="min-h-11 rounded-xl border border-white/30 px-4 text-sm font-bold text-white"
              >
                Use guided stage instead
              </button>
            </div>
          ) : null}

          {/* play overlay */}
          {!playing && !error && mode === "video" ? (
            <button
              type="button"
              onClick={togglePlay}
              aria-label="Play the product demo video"
              className="absolute inset-0 flex items-center justify-center bg-black/25"
            >
              <motion.span
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                className="bg-accent-app flex h-16 w-16 items-center justify-center rounded-full shadow-lg"
              >
                <Play size={30} weight="fill" aria-hidden="true" />
              </motion.span>
            </button>
          ) : null}
        </div>

        {/* timeline + controls */}
        <div className="surface border-t border-app px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div role="group" aria-label="Playback mode" className="card-a11y flex items-center gap-1 p-1">
              <button
                type="button"
                onClick={() => setMode("video")}
                aria-pressed={mode === "video"}
                className={`flex min-h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-extrabold transition-colors ${
                  mode === "video" ? "soft-accent" : "text-muted-app hover:surface-muted"
                }`}
              >
                <VideoCamera size={14} weight="bold" aria-hidden="true" />
                Video
              </button>
              <button
                type="button"
                onClick={() => setMode("stage")}
                aria-pressed={mode === "stage"}
                className={`flex min-h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-extrabold transition-colors ${
                  mode === "stage" ? "soft-accent" : "text-muted-app hover:surface-muted"
                }`}
              >
                <Playlist size={14} weight="bold" aria-hidden="true" />
                Stage
              </button>
            </div>
            <p className="text-muted-app text-xs font-bold tabular-nums">
              {formatTime(time)} / {formatTime(duration)} &middot; {progress.toFixed(0)}%
            </p>
          </div>

          <div className="relative pt-4">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-2" aria-hidden="true">
              {chapters.map((c) => (
                <span
                  key={c.id}
                  className="bg-accent-app absolute top-0 h-2 w-[2px] rounded-full opacity-70"
                  style={{ left: `${duration ? Math.min(100, (c.start / duration) * 100) : 0}%` }}
                />
              ))}
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(1, Math.floor(duration))}
              step={1}
              value={Math.min(Math.floor(time), Math.floor(duration))}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Seek demo position"
              className="w-full cursor-pointer accent-[var(--app-accent)]"
            />
          </div>

          <DemoPlayerToolbar
            playing={playing}
            hasStarted={time > 0}
            speed={speed}
            captionsOn={captionsOn}
            muted={muted}
            volume={volume}
            onTogglePlay={togglePlay}
            onCycleSpeed={cycleSpeed}
            onToggleCaptions={() => setCaptionsOn((c) => !c)}
            onToggleMuted={() => setMuted((m) => !m)}
            onVolume={(value) => {
              setVolume(value);
              setMuted(false);
            }}
            onPip={() => void enterPip()}
            onFullscreen={enterFullscreen}
            onRead={readChapter}
          />

          {/* caption language picker */}
          <div className="mt-3 border-t border-app pt-3">
            <p className="text-muted-app flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
              <Globe size={14} weight="bold" aria-hidden="true" />
              Caption language &middot; {DEMO_LANGUAGES.length} languages
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {DEMO_LANGUAGES.map((l) => {
                const active = l.code === lang;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLang(l.code)}
                    aria-pressed={active}
                    className={`flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold transition-colors ${
                      active ? "soft-accent" : "card-a11y text-app hover:surface-muted"
                    }`}
                  >
                    <span aria-hidden="true">{l.flag}</span>
                    {l.native}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <DemoChaptersPanel
        chapters={chapters}
        chapterId={chapter.id}
        playing={playing}
        bars={bars}
        transcript={transcript}
        activeLineId={activeLine.id}
        onSeek={seek}
      />
    </div>
  );
}
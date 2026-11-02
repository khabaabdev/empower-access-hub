import {
  CornersOut,
  Gauge,
  Pause,
  PictureInPicture,
  Play,
  SpeakerHigh,
  SpeakerSimpleX,
  Waveform,
} from "@phosphor-icons/react";

type Props = {
  playing: boolean;
  hasStarted: boolean;
  speed: number;
  captionsOn: boolean;
  muted: boolean;
  volume: number;
  onTogglePlay: () => void;
  onCycleSpeed: () => void;
  onToggleCaptions: () => void;
  onToggleMuted: () => void;
  onVolume: (value: number) => void;
  onPip: () => void;
  onFullscreen: () => void;
  onRead: () => void;
};

const ghost = "card-a11y text-app flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold";

export default function DemoPlayerToolbar({
  playing,
  hasStarted,
  speed,
  captionsOn,
  muted,
  volume,
  onTogglePlay,
  onCycleSpeed,
  onToggleCaptions,
  onToggleMuted,
  onVolume,
  onPip,
  onFullscreen,
  onRead,
}: Props) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onTogglePlay}
        className="bg-accent-app flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-extrabold"
      >
        {playing ? <Pause size={18} weight="fill" aria-hidden="true" /> : <Play size={18} weight="fill" aria-hidden="true" />}
        {playing ? "Pause" : hasStarted ? "Resume" : "Play"}
      </button>

      <button
        type="button"
        onClick={onCycleSpeed}
        aria-label={`Playback speed ${speed} times`}
        className={ghost}
      >
        <Gauge size={18} weight="bold" aria-hidden="true" />
        {speed}&times;
      </button>

      <button
        type="button"
        onClick={onToggleCaptions}
        aria-pressed={captionsOn}
        className={`flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold ${
          captionsOn ? "soft-accent" : "card-a11y text-app"
        }`}
      >
        <Waveform size={18} weight="bold" aria-hidden="true" />
        Captions
      </button>

      <button
        type="button"
        onClick={onToggleMuted}
        aria-pressed={!muted}
        className={`flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold ${
          muted ? "card-a11y text-app" : "soft-accent"
        }`}
      >
        {muted ? <SpeakerSimpleX size={18} weight="bold" aria-hidden="true" /> : <SpeakerHigh size={18} weight="bold" aria-hidden="true" />}
        {muted ? "Muted" : "Sound"}
      </button>

      <label className="flex min-h-11 items-center gap-2 rounded-xl border border-app px-3">
        <span className="text-muted-app text-xs font-extrabold uppercase tracking-wider">Vol</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(e) => onVolume(Number(e.target.value) / 100)}
          aria-label="Video volume"
          className="h-1.5 w-20 cursor-pointer accent-[var(--app-accent)]"
        />
      </label>

      <button type="button" onClick={onPip} aria-label="Picture in picture" className={ghost}>
        <PictureInPicture size={18} weight="bold" aria-hidden="true" />
        <span className="hidden sm:inline">Pop out</span>
      </button>

      <button type="button" onClick={onFullscreen} aria-label="Fullscreen" className={ghost}>
        <CornersOut size={18} weight="bold" aria-hidden="true" />
        <span className="hidden sm:inline">Fullscreen</span>
      </button>

      <button
        type="button"
        onClick={onRead}
        className="text-app ml-auto flex min-h-11 items-center gap-1.5 rounded-xl border border-app px-3 text-xs font-extrabold"
      >
        <SpeakerHigh size={16} weight="bold" aria-hidden="true" />
        Read this chapter
      </button>
    </div>
  );
}
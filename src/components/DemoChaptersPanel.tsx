import { Waveform } from "@phosphor-icons/react";
import type { DemoChapter, DemoCharacter, TranscriptLine } from "../data/mockData";
import { DEMO_CHARACTERS } from "../data/mockData";

type Props = {
  chapters: DemoChapter[];
  chapterId: string;
  playing: boolean;
  bars: number[];
  transcript: TranscriptLine[];
  activeLineId: string;
  onSeek: (to: number) => void;
};

function getCharacter(id: string): DemoCharacter | undefined {
  return DEMO_CHARACTERS.find((c) => c.id === id);
}

export default function DemoChaptersPanel({
  chapters,
  chapterId,
  playing,
  bars,
  transcript,
  activeLineId,
  onSeek,
}: Props) {
  return (
    <div className="grid gap-4">
      <div className="card-a11y p-4">
        <p className="text-app text-sm font-extrabold">Character Chapters</p>
        <ul className="mt-2 space-y-2">
          {chapters.map((c) => {
            const active = c.id === chapterId;
            const character = getCharacter(c.characterId);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSeek(c.start + 0.1)}
                  className={`flex w-full items-start gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors ${
                    active ? "soft-accent" : "text-muted-app hover:surface-muted"
                  }`}
                >
                  {character ? (
                    <span className="text-xl leading-none" aria-hidden="true">
                      {character.avatar}
                    </span>
                  ) : null}
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="text-accent-app shrink-0 text-xs font-extrabold tabular-nums">{c.time}</span>
                      <span className="truncate text-sm font-bold">{c.title}</span>
                      <span className="text-muted-app ml-auto shrink-0 text-[10px] font-bold">
                        {Math.round(c.end - c.start)}s
                      </span>
                    </span>
                    {character ? (
                      <span className="mt-0.5 block truncate text-[11px] font-semibold leading-snug text-muted-app">
                        {character.name} &middot; {character.role}
                      </span>
                    ) : null}
                    {character && character.accessibilityNeeds.length > 0 ? (
                      <span className="mt-1 flex flex-wrap gap-1">
                        {character.accessibilityNeeds.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-block rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </span>
                    ) : null}
                  </span>
                  {active && playing ? (
                    <span className="ml-auto flex shrink-0 items-end gap-[2px] self-center" aria-hidden="true">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="bg-accent-app w-[3px] rounded-full"
                          style={{ height: `${5 + (bars[i] ?? 0.2) * 11}px`, transition: "height 90ms linear" }}
                        />
                      ))}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="card-a11y p-4">
        <p className="text-app flex items-center gap-2 text-sm font-extrabold">
          <Waveform size={16} weight="bold" aria-hidden="true" className="text-accent-app" />
          Synced transcript
        </p>
        <ul className="thin-scroll mt-2 max-h-52 space-y-1 overflow-y-auto pr-1">
          {transcript.map((line) => {
            const active = line.id === activeLineId;
            return (
              <li key={line.id}>
                <button
                  type="button"
                  onClick={() => onSeek(line.at)}
                  className={`flex w-full items-start gap-2 rounded-lg px-2 py-1 text-left text-xs leading-snug transition-colors ${
                    active ? "soft-accent font-bold" : "text-muted-app hover:surface-muted"
                  }`}
                >
                  <span className="text-accent-app shrink-0 font-extrabold tabular-nums">{line.time}</span>
                  <span>
                    <span className="mr-1 font-extrabold">{line.speaker}:</span>
                    {line.text}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

import { ArrowRight, VideoCamera } from "@phosphor-icons/react";
import { DEMO_ARTIFACTS, DEMO_DURATION } from "../data/mockData";
import DemoVideoPlayer from "./DemoVideoPlayer";

export default function DemoVideoSection() {
  return (
    <section className="border-b border-app surface">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <span className="soft-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider">
          <VideoCamera size={14} weight="bold" aria-hidden="true" />
          Realistic Human Demo &middot; {Math.floor(DEMO_DURATION / 60)}m{DEMO_DURATION % 60}s guided tour
        </span>
        <h2 className="text-app mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          See how real people navigate accessibility
        </h2>
        <p className="text-muted-app mt-1 max-w-2xl text-sm leading-relaxed">
          Follow Maya, Marcus, Elena, David, and Aisha through six chapters of realistic human stories. Scrub the
          timeline, jump between chapters, switch the caption language, or flip to the guided stage with character
          personas when you would rather read than watch.
        </p>

        <DemoVideoPlayer />

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {DEMO_ARTIFACTS.map((a) => (
            <a
              key={a.id}
              href={a.href}
              target="_blank"
              rel="noreferrer"
              className="card-a11y text-app flex min-h-11 items-center justify-between gap-2 p-4 hover:surface-muted"
            >
              <span>
                <span className="block text-sm font-extrabold">{a.label}</span>
                <span className="text-muted-app block text-xs leading-snug">{a.detail}</span>
              </span>
              <ArrowRight size={18} weight="bold" aria-hidden="true" className="text-accent-app shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
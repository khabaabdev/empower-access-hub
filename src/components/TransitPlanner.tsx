import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bus,
  CheckCircle,
  Printer,
  SpeakerHigh,
  Signpost,
  Timer,
  WarningCircle,
  Compass,
  Ear,
} from "@phosphor-icons/react";
import {
  RAMP_META,
  TRANSIT_ROUTES,
  speakText,
  type RampStatus,
} from "../data/mockData";

function rampTone(status: RampStatus): string {
  const tone = RAMP_META[status].tone;
  if (tone === "good") return "soft-accent";
  if (tone === "warn") return "warn-accent";
  return "warn-accent";
}

export default function TransitPlanner() {
  const [routeId, setRouteId] = useState(TRANSIT_ROUTES[0].id);
  const [stepFreeOnly, setStepFreeOnly] = useState(false);

  const routes = useMemo(
    () => (stepFreeOnly ? TRANSIT_ROUTES.filter((r) => r.stepFree) : TRANSIT_ROUTES),
    [stepFreeOnly],
  );

  const route = useMemo(
    () => routes.find((r) => r.id === routeId) ?? routes[0] ?? TRANSIT_ROUTES[0],
    [routes, routeId],
  );

  return (
    <section className="border-b border-app surface">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <span className="soft-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider">
          <Bus size={14} weight="bold" aria-hidden="true" />
          Sensory transit wayfinding
        </span>
        <h2 className="text-app mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Plan a step-free, low-stress trip
        </h2>
        <p className="text-muted-app mt-1 max-w-2xl text-sm leading-relaxed">
          Every route shows ramp status, crowd level, the quietest travel window and turn-by-turn sensory
          checkpoints. Print the directions to take with you.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStepFreeOnly((v) => !v)}
            aria-pressed={stepFreeOnly}
            className={`flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold ${stepFreeOnly ? "soft-accent" : "card-a11y text-app"}`}
          >
            <CheckCircle size={18} weight="bold" aria-hidden="true" />
            Step-free routes only
          </button>
          <button
            type="button"
            onClick={() => speakText(`Route ${route.name} to ${route.destination}. ${route.notes} Quietest time to travel: ${route.quietWindow}.`)}
            className="text-app flex min-h-11 items-center gap-2 rounded-xl border border-app px-3 text-sm font-bold"
          >
            <SpeakerHigh size={18} weight="bold" aria-hidden="true" />
            Describe this route
          </button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Route list */}
          <div className="space-y-2">
            {routes.map((r) => {
              const active = r.id === route.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRouteId(r.id)}
                  aria-pressed={active}
                  className={`card-a11y w-full p-3 text-left transition-colors ${active ? "outline outline-2 outline-[var(--app-accent)]" : "hover:surface-muted"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-app text-sm font-extrabold">{r.name}</p>
                    <span className="text-muted-app flex items-center gap-1 text-xs font-bold">
                      <Timer size={13} weight="bold" aria-hidden="true" />
                      {r.duration}
                    </span>
                  </div>
                  <p className="text-muted-app mt-0.5 truncate text-xs">{r.destination}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${rampTone(r.ramp)}`}>
                      {RAMP_META[r.ramp].label}
                    </span>
                    <span className="card-a11y text-muted-app px-2 py-0.5 text-[11px] font-bold">
                      Crowd: {r.crowd}
                    </span>
                    <span className="card-a11y text-muted-app px-2 py-0.5 text-[11px] font-bold">
                      Steps: {r.steps}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Directions */}
          <motion.div key={route.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="card-a11y p-4">
            <div className="printable">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-app flex items-center gap-2 text-base font-extrabold">
                    <Signpost size={20} weight="bold" aria-hidden="true" className="text-accent-app" />
                    {route.name}
                  </p>
                  <p className="text-muted-app mt-0.5 text-sm">To {route.destination}</p>
                </div>
                <span className="soft-accent rounded-full px-3 py-1 text-xs font-extrabold">{route.duration}</span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="surface-muted rounded-lg p-2">
                  <p className="text-muted-app text-[10px] font-extrabold uppercase tracking-wider">Ramp</p>
                  <p className="text-app text-xs font-extrabold">{RAMP_META[route.ramp].label}</p>
                </div>
                <div className="surface-muted rounded-lg p-2">
                  <p className="text-muted-app text-[10px] font-extrabold uppercase tracking-wider">Crowd</p>
                  <p className="text-app text-xs font-extrabold">{route.crowd}</p>
                </div>
                <div className="surface-muted rounded-lg p-2">
                  <p className="text-muted-app text-[10px] font-extrabold uppercase tracking-wider">Steps</p>
                  <p className="text-app text-xs font-extrabold">{route.steps}</p>
                </div>
                <div className="surface-muted rounded-lg p-2">
                  <p className="text-muted-app text-[10px] font-extrabold uppercase tracking-wider">Quietest</p>
                  <p className="text-app text-xs font-extrabold leading-tight">{route.quietWindow}</p>
                </div>
              </div>

              <p className="text-muted-app mt-3 flex items-center gap-1.5 text-xs font-semibold">
                <Compass size={14} weight="bold" aria-hidden="true" className="text-accent-app" />
                {route.notes}
              </p>

              <ol className="mt-3 space-y-3">
                {route.legs.map((leg, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="bg-accent-app flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-app text-sm font-bold leading-snug">{leg.instruction}</p>
                      <p className="text-muted-app mt-0.5 text-xs font-semibold">Checkpoint: {leg.checkpoint}</p>
                      <p className="text-muted-app mt-0.5 flex items-start gap-1.5 text-xs leading-snug">
                        <Ear size={13} weight="bold" aria-hidden="true" className="mt-0.5 shrink-0 text-accent-app" />
                        {leg.sensory}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              {route.ramp !== "open" ? (
                <div className="warn-accent mt-3 flex items-start gap-2 rounded-lg p-3">
                  <WarningCircle size={16} weight="bold" aria-hidden="true" className="mt-0.5 shrink-0" />
                  <p className="text-xs font-semibold leading-snug">
                    {RAMP_META[route.ramp].label}. Call the dispatch line in the Emergency Kit to arrange assistance.
                  </p>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="text-app mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-app px-4 text-sm font-extrabold"
            >
              <Printer size={18} weight="bold" aria-hidden="true" />
              Print these directions
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

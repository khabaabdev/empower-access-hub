import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CaretLeft,
  CheckCircle,
  Ear,
  FileText,
  MagicWand,
  Wheelchair,
  X,
} from "@phosphor-icons/react";
import {
  MOBILITY_OPTIONS,
  WIZARD_DOC_OPTIONS,
  WIZARD_SENSORY_OPTIONS,
  type MobilityNeed,
  type ResourceListing,
  type WizardAnswers,
} from "../data/mockData";

interface MatchWizardModalProps {
  open: boolean;
  onClose: () => void;
  listings: ResourceListing[];
  onOpenListing: (listing: ResourceListing) => void;
}

const STEPS = [
  { id: "mobility", title: "How do you get around?", icon: Wheelchair },
  { id: "sensory", title: "What space feels safe?", icon: Ear },
  { id: "documents", title: "What about paperwork?", icon: FileText },
] as const;

function scoreListing(l: ResourceListing, a: WizardAnswers): number {
  const want = new Set<string>();
  if (a.mobility === "wheelchair" || a.mobility === "mobility-aid") want.add("wheelchair-accessible");
  if (a.mobility === "low-fatigue") want.add("quiet-space");
  if (a.sensory === "calm") {
    want.add("sensory-friendly");
    want.add("quiet-space");
  }
  if (a.sensory === "outdoor") want.add("outdoor-seating");
  if (a.documents === "none") want.add("no-id-required");
  if (a.documents === "assisted") want.add("staff-assistance");
  let score = 0;
  for (const tag of l.accessibilityTags) if (want.has(tag)) score += 2;
  if (a.sensory === "calm" && l.sensoryProfile.noise === "Low") score += 1;
  return score;
}

export default function MatchWizardModal({ open, onClose, listings, onOpenListing }: MatchWizardModalProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<WizardAnswers>({ mobility: "none", sensory: "any", documents: "simple" });

  const results = useMemo(() => {
    if (step < STEPS.length) return [];
    return listings
      .map((l) => ({ l, s: scoreListing(l, answers) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 4);
  }, [step, listings, answers]);

  const reset = () => {
    setStep(0);
    setAnswers({ mobility: "none", sensory: "any", documents: "simple" });
  };

  const done = step >= STEPS.length;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Find my fit wizard"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="card-a11y surface w-full max-w-lg overflow-hidden rounded-t-2xl sm:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-app p-4">
              <div className="flex items-center gap-2">
                <MagicWand size={22} weight="bold" aria-hidden="true" className="text-accent-app" />
                <div>
                  <p className="text-app text-base font-extrabold">Find my fit</p>
                  <p className="text-muted-app text-xs">Three questions, instant accommodation matches</p>
                </div>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="text-app flex h-10 w-10 items-center justify-center rounded-lg border border-app">
                <X size={18} weight="bold" aria-hidden="true" />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-3 flex gap-1.5">
                {STEPS.map((s, i) => (
                  <span key={s.id} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-accent-app" : "border-app bg-[var(--app-surface-2)]"}`} />
                ))}
              </div>

              {!done ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <p className="text-app flex items-center gap-2 text-base font-extrabold">
                      {step === 0 ? <Wheelchair size={18} weight="bold" aria-hidden="true" className="text-accent-app" /> : null}
                      {step === 1 ? <Ear size={18} weight="bold" aria-hidden="true" className="text-accent-app" /> : null}
                      {step === 2 ? <FileText size={18} weight="bold" aria-hidden="true" className="text-accent-app" /> : null}
                      {STEPS[step].title}
                    </p>
                    <div className="mt-3 space-y-2">
                      {step === 0 &&
                        MOBILITY_OPTIONS.map((o) => (
                          <OptionButton
                            key={o.id}
                            active={answers.mobility === o.id}
                            label={o.label}
                            hint={o.hint}
                            onClick={() => setAnswers((a) => ({ ...a, mobility: o.id as MobilityNeed }))}
                          />
                        ))}
                      {step === 1 &&
                        WIZARD_SENSORY_OPTIONS.map((o) => (
                          <OptionButton key={o.id} active={answers.sensory === o.id} label={o.label} hint={o.hint} onClick={() => setAnswers((a) => ({ ...a, sensory: o.id }))} />
                        ))}
                      {step === 2 &&
                        WIZARD_DOC_OPTIONS.map((o) => (
                          <OptionButton key={o.id} active={answers.documents === o.id} label={o.label} hint={o.hint} onClick={() => setAnswers((a) => ({ ...a, documents: o.id }))} />
                        ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setStep((s) => Math.max(0, s - 1))}
                        disabled={step === 0}
                        className="text-app flex min-h-11 items-center gap-1 rounded-xl border border-app px-3 text-sm font-bold disabled:opacity-40"
                      >
                        <CaretLeft size={16} weight="bold" aria-hidden="true" />
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep((s) => s + 1)}
                        className="bg-accent-app flex min-h-11 items-center gap-1.5 rounded-xl px-5 text-sm font-extrabold"
                      >
                        {step === STEPS.length - 1 ? "See my matches" : "Next"}
                        <ArrowRight size={16} weight="bold" aria-hidden="true" />
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div>
                  <p className="text-app flex items-center gap-2 text-base font-extrabold">
                    <CheckCircle size={18} weight="bold" aria-hidden="true" className="text-accent-app" />
                    Your best matches
                  </p>
                  <ul className="mt-3 space-y-2">
                    {results.map(({ l, s }) => (
                      <li key={l.id}>
                        <button
                          type="button"
                          onClick={() => {
                            onOpenListing(l);
                            onClose();
                          }}
                          className="card-a11y flex w-full items-center justify-between gap-2 p-3 text-left hover:surface-muted"
                        >
                          <span className="min-w-0">
                            <span className="text-app block truncate text-sm font-extrabold">{l.title}</span>
                            <span className="text-muted-app block truncate text-xs">{l.plainSummary}</span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span className="soft-accent block rounded-full px-2 py-0.5 text-[11px] font-extrabold">{s} fit</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={reset} className="text-app mt-4 min-h-11 w-full rounded-xl border border-app text-sm font-extrabold">
                    Start over
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function OptionButton({ active, label, hint, onClick }: { active: boolean; label: string; hint: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex min-h-12 w-full items-start gap-2 rounded-xl border-2 p-3 text-left transition-colors ${active ? "border-[var(--app-accent)] soft-accent" : "border-app card-a11y"}`}
    >
      <span aria-hidden="true" className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${active ? "border-[var(--app-accent)]" : "border-app"}`}>
        {active ? <span className="bg-accent-app h-2.5 w-2.5 rounded-full" /> : null}
      </span>
      <span>
        <span className="text-app block text-sm font-extrabold">{label}</span>
        <span className="text-muted-app block text-xs leading-snug">{hint}</span>
      </span>
    </button>
  );
}

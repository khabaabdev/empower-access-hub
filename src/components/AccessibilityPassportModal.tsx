import { useEffect, useRef, useState } from "react";
import {
  BookmarkSimple,
  Check,
  Copy,
  IdentificationCard,
  Printer,
  SpeakerHigh,
  Wheelchair,
  X,
} from "@phosphor-icons/react";
import {
  ASSISTANCE_OPTIONS,
  COMMUNICATION_OPTIONS,
  MOBILITY_OPTIONS,
  SENSORY_FLAGS,
  passportLineText,
  speakText,
  type AccessibilityPassport,
} from "../data/mockData";

interface AccessibilityPassportModalProps {
  passport: AccessibilityPassport;
  onSave: (passport: AccessibilityPassport) => void;
  onClose: () => void;
}

export default function AccessibilityPassportModal({
  passport,
  onSave,
  onClose,
}: AccessibilityPassportModalProps) {
  const [draft, setDraft] = useState<AccessibilityPassport>(passport);
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const save = () => {
    onSave({ ...draft, updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) });
    onClose();
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(passportLineText(draft));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close accessibility passport"
        onClick={onClose}
        className="absolute inset-0 bg-[#0b1220]/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="passport-title"
        className="card-a11y thin-scroll relative max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-b-none sm:rounded-2xl"
        style={{ backgroundColor: "var(--app-surface)" }}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-app surface px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="text-muted-app flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider">
              <IdentificationCard size={14} weight="bold" aria-hidden="true" />
              Accessibility Passport
            </p>
            <h2 id="passport-title" className="text-app text-lg font-extrabold leading-snug sm:text-xl">
              Your needs, ready to share
            </h2>
            <p className="text-muted-app text-xs">
              Fill this in once. Show or read it wherever you go, so you never re-explain yourself.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="card-a11y text-app flex h-11 w-11 shrink-0 items-center justify-center"
          >
            <X size={20} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 px-4 py-4 sm:px-6 sm:py-5">
          <label className="block">
            <span className="text-app text-sm font-extrabold">Your name (optional)</span>
            <input
              type="text"
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              placeholder="How staff should greet you"
              className="text-app surface-muted mt-1.5 h-12 w-full rounded-xl border border-app px-3 text-sm placeholder:text-[var(--app-muted)]"
            />
          </label>

          <fieldset>
            <legend className="text-app mb-2 text-xs font-extrabold uppercase tracking-wider">Mobility</legend>
            <div className="flex flex-wrap gap-2">
              {MOBILITY_OPTIONS.map((option) => {
                const active = draft.mobility === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={active}
                    title={option.hint}
                    onClick={() => setDraft({ ...draft, mobility: option.id })}
                    className={`min-h-11 rounded-full border px-3 text-sm font-bold ${
                      active ? "border-[var(--app-accent)] soft-accent" : "border-app text-app surface"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-app mb-2 text-xs font-extrabold uppercase tracking-wider">
              Communication
            </legend>
            <div className="flex flex-wrap gap-2">
              {COMMUNICATION_OPTIONS.map((option) => {
                const active = draft.communication === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={active}
                    title={option.hint}
                    onClick={() => setDraft({ ...draft, communication: option.id })}
                    className={`min-h-11 rounded-full border px-3 text-sm font-bold ${
                      active ? "border-[var(--app-accent)] soft-accent" : "border-app text-app surface"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-app mb-2 text-xs font-extrabold uppercase tracking-wider">
              Support on the day
            </legend>
            <div className="flex flex-wrap gap-2">
              {ASSISTANCE_OPTIONS.map((option) => {
                const active = draft.assistance === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={active}
                    title={option.hint}
                    onClick={() => setDraft({ ...draft, assistance: option.id })}
                    className={`min-h-11 rounded-full border px-3 text-sm font-bold ${
                      active ? "border-[var(--app-accent)] soft-accent" : "border-app text-app surface"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-app mb-2 text-xs font-extrabold uppercase tracking-wider">
              Sensory needs
            </legend>
            <div className="flex flex-wrap gap-2">
              {SENSORY_FLAGS.map((flag) => {
                const active = draft.sensory[flag.key];
                return (
                  <ToggleChip
                    key={flag.key}
                    label={flag.label}
                    active={active}
                    onClick={() =>
                      setDraft({ ...draft, sensory: { ...draft.sensory, [flag.key]: !active } })
                    }
                  />
                );
              })}
              <ToggleChip
                label="A service animal is with me"
                active={draft.serviceAnimal}
                onClick={() => setDraft({ ...draft, serviceAnimal: !draft.serviceAnimal })}
              />
            </div>
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-app text-sm font-extrabold">Languages I use</span>
              <input
                type="text"
                value={draft.languages}
                onChange={(event) => setDraft({ ...draft, languages: event.target.value })}
                placeholder="e.g. English, Spanish"
                className="text-app surface-muted mt-1.5 h-12 w-full rounded-xl border border-app px-3 text-sm placeholder:text-[var(--app-muted)]"
              />
            </label>
            <label className="block">
              <span className="text-app text-sm font-extrabold">Anything else?</span>
              <input
                type="text"
                value={draft.notes}
                onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
                placeholder="e.g. Please speak slowly"
                className="text-app surface-muted mt-1.5 h-12 w-full rounded-xl border border-app px-3 text-sm placeholder:text-[var(--app-muted)]"
              />
            </label>
          </div>

          {/* Live preview card */}
          <div className="soft-accent rounded-xl p-4">
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
              <Wheelchair size={16} weight="bold" aria-hidden="true" />
              Your passport card
            </p>
            <p className="mt-1.5 text-sm leading-relaxed">{passportLineText(draft)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copySummary}
                className="flex min-h-11 items-center gap-1.5 rounded-lg border border-[var(--app-accent)] px-3 text-xs font-extrabold"
              >
                {copied ? <Check size={15} weight="bold" aria-hidden="true" /> : <Copy size={15} weight="bold" aria-hidden="true" />}
                {copied ? "Copied" : "Copy text"}
              </button>
              <button
                type="button"
                onClick={() => speakText(passportLineText(draft))}
                className="flex min-h-11 items-center gap-1.5 rounded-lg border border-[var(--app-accent)] px-3 text-xs font-extrabold"
              >
                <SpeakerHigh size={15} weight="bold" aria-hidden="true" />
                Read aloud
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex min-h-11 items-center gap-1.5 rounded-lg border border-[var(--app-accent)] px-3 text-xs font-extrabold"
              >
                <Printer size={15} weight="bold" aria-hidden="true" />
                Print
              </button>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center gap-2 border-t border-app surface px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={save}
            className="bg-accent-app flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold"
          >
            <BookmarkSimple size={18} weight="bold" aria-hidden="true" />
            Save passport on this device
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-app min-h-12 rounded-xl border border-app px-4 text-sm font-bold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-sm font-bold ${
        active ? "border-[var(--app-accent)] soft-accent" : "border-app text-app surface"
      }`}
    >
      {active ? <Check size={14} weight="bold" aria-hidden="true" /> : null}
      {label}
    </button>
  );
}
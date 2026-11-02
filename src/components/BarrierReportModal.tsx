import { useEffect, useRef, useState } from "react";
import { Flag, WarningCircle, X } from "@phosphor-icons/react";
import { BARRIER_TYPES, type BarrierType, type ResourceListing } from "../data/mockData";

interface BarrierReportModalProps {
  listing: ResourceListing;
  onClose: () => void;
  onSubmit: (type: BarrierType, detail: string) => void;
}

export default function BarrierReportModal({ listing, onClose, onSubmit }: BarrierReportModalProps) {
  const [type, setType] = useState<BarrierType>("entrance");
  const [detail, setDetail] = useState("");
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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close barrier report"
        onClick={onClose}
        className="absolute inset-0 bg-[#0b1220]/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="barrier-title"
        className="card-a11y thin-scroll relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-b-none sm:rounded-2xl"
        style={{ backgroundColor: "var(--app-surface)" }}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-app surface px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-muted-app flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider">
              <WarningCircle size={14} weight="bold" aria-hidden="true" />
              Report a barrier
            </p>
            <h2 id="barrier-title" className="text-app text-base font-extrabold leading-snug">
              {listing.title}
            </h2>
            <p className="text-muted-app text-xs">{listing.organization}</p>
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

        <div className="space-y-4 px-4 py-4 sm:px-5">
          <p className="text-muted-app text-sm leading-relaxed">
            Something wrong with the access details? Tell us what you found. A coordinator re-checks it within
            two business days. No account or name needed.
          </p>

          <fieldset>
            <legend className="text-app mb-2 text-xs font-extrabold uppercase tracking-wider">
              What went wrong?
            </legend>
            <div className="flex flex-wrap gap-2">
              {BARRIER_TYPES.map((option) => {
                const active = type === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setType(option.id)}
                    className={`min-h-11 rounded-full border px-3 text-xs font-bold ${
                      active ? "border-[var(--app-accent)] soft-accent" : "border-app text-app surface"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="block">
            <span className="text-app text-sm font-extrabold">Details (optional)</span>
            <textarea
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              rows={4}
              placeholder="e.g. The ramp on Elm Street was blocked by a delivery van at 11am."
              className="text-app surface-muted mt-1.5 w-full rounded-xl border border-app px-3 py-2 text-sm placeholder:text-[var(--app-muted)]"
            />
          </label>
        </div>

        <div className="sticky bottom-0 flex items-center gap-2 border-t border-app surface px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={() => onSubmit(type, detail)}
            className="bg-accent-app flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold"
          >
            <Flag size={17} weight="bold" aria-hidden="true" />
            Send report
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
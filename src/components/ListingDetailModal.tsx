import { useEffect, useRef } from "react";
import {
  BookmarkSimple,
  Bus,
  CheckCircle,
  Clock,
  Ear,
  EnvelopeSimple,
  Globe,
  Flag,
  MapPin,
  Phone,
  ShieldCheck,
  SpeakerHigh,
  WarningCircle,
  Wheelchair,
  X,
} from "@phosphor-icons/react";
import {
  categoryLabel,
  speakText,
  tagLabel,
  tagPlain,
  type ResourceListing,
} from "../data/mockData";

interface ListingDetailModalProps {
  listing: ResourceListing;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onClose: () => void;
  onRequest: (listing: ResourceListing) => void;
  onReportBarrier: (listing: ResourceListing) => void;
}

export default function ListingDetailModal({
  listing,
  saved,
  onToggleSave,
  onClose,
  onRequest,
  onReportBarrier,
}: ListingDetailModalProps) {
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
        aria-label="Close details"
        onClick={onClose}
        className="absolute inset-0 bg-[#0b1220]/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="listing-detail-title"
        className="card-a11y relative max-h-[92dvh] w-full max-w-2xl overflow-y-auto thin-scroll rounded-b-none sm:rounded-2xl"
        style={{ backgroundColor: "var(--app-surface)" }}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-app surface px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="text-muted-app text-[11px] font-extrabold uppercase tracking-wider">
              {categoryLabel(listing.category)}
            </p>
            <h2 id="listing-detail-title" className="text-app text-lg font-extrabold leading-snug sm:text-xl">
              {listing.title}
            </h2>
            <p className="text-muted-app text-xs font-semibold">{listing.organization}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="card-a11y text-app flex h-11 w-11 shrink-0 items-center justify-center"
          >
            <X size={20} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${listing.isOpenNow ? "soft-accent" : "warn-accent"}`}>
              {listing.isOpenNow ? "Open right now" : "By appointment or schedule"}
            </span>
            <span className="surface-muted text-app flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold">
              <MapPin size={13} weight="bold" aria-hidden="true" />
              {listing.distanceMiles === 0 ? "Remote access" : `${listing.distanceMiles} miles away`}
            </span>
            {listing.isCommunitySubmitted ? (
              <span className="warn-accent rounded-full px-3 py-1 text-xs font-extrabold">
                Community added · awaiting verification
              </span>
            ) : null}
          </div>

          <section className="soft-accent rounded-xl p-4" aria-labelledby="plain-summary">
            <h3 id="plain-summary" className="flex items-center gap-2 text-sm font-extrabold">
              <Ear size={18} weight="bold" aria-hidden="true" />
              In plain language
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed">{listing.plainSummary}</p>
            <button
              type="button"
              onClick={() => speakText(`${listing.title}. ${listing.plainSummary}`)}
              className="mt-3 flex min-h-11 items-center gap-2 rounded-lg border border-[var(--app-accent)] px-3 text-xs font-extrabold"
            >
              <SpeakerHigh size={16} weight="bold" aria-hidden="true" />
              Read this aloud
            </button>
          </section>

          <section aria-labelledby="about-heading">
            <h3 id="about-heading" className="text-app text-sm font-extrabold uppercase tracking-wider">
              What happens here
            </h3>
            <p className="text-app mt-1.5 text-sm leading-relaxed">{listing.description}</p>
          </section>

          <section aria-labelledby="accommodations-heading">
            <h3 id="accommodations-heading" className="text-app text-sm font-extrabold uppercase tracking-wider">
              Accommodations on file
            </h3>
            <ul className="mt-2 space-y-2">
              {listing.accommodations.map((item) => (
                <li key={item.label} className="flex items-start gap-2 text-sm">
                  <CheckCircle
                    size={17}
                    weight="bold"
                    aria-hidden="true"
                    className="text-accent-app mt-0.5 shrink-0"
                  />
                  <span className="text-app">{item.label}</span>
                  {item.verified ? (
                    <span className="ml-auto shrink-0 rounded-md bg-[var(--app-accent-soft)] px-1.5 py-0.5 text-[10px] font-extrabold text-[var(--app-accent-strong)]">
                      verified
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="sensory-heading">
            <h3 id="sensory-heading" className="text-app text-sm font-extrabold uppercase tracking-wider">
              Sensory profile
            </h3>
            <dl className="mt-2 grid grid-cols-3 gap-2">
              <SensoryCell label="Noise" value={listing.sensoryProfile.noise} />
              <SensoryCell label="Lighting" value={listing.sensoryProfile.lighting} />
              <SensoryCell label="Crowds" value={listing.sensoryProfile.crowd} />
            </dl>
          </section>

          <section aria-labelledby="access-tags-heading">
            <h3 id="access-tags-heading" className="text-app text-sm font-extrabold uppercase tracking-wider">
              Access tags
            </h3>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {listing.accessibilityTags.map((tag) => (
                <li key={tag} className="surface-muted rounded-lg px-3 py-2">
                  <p className="text-app flex items-center gap-1.5 text-xs font-extrabold">
                    <Wheelchair size={14} weight="bold" aria-hidden="true" />
                    {tagLabel(tag)}
                  </p>
                  <p className="text-muted-app mt-0.5 text-[11px] leading-snug">{tagPlain(tag)}</p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="logistics-heading" className="grid gap-3 sm:grid-cols-2">
            <div>
              <h3 id="logistics-heading" className="text-app text-sm font-extrabold uppercase tracking-wider">
                When & where
              </h3>
              <ul className="text-muted-app mt-1.5 space-y-1.5 text-sm">
                <li className="flex items-start gap-2">
                  <Clock size={16} weight="bold" aria-hidden="true" className="mt-0.5 shrink-0" />
                  {listing.hours}
                </li>
                <li className="flex items-start gap-2">
                  <MapPin size={16} weight="bold" aria-hidden="true" className="mt-0.5 shrink-0" />
                  {listing.address}
                </li>
                <li className="flex items-start gap-2">
                  <Bus size={16} weight="bold" aria-hidden="true" className="mt-0.5 shrink-0" />
                  <span>
                    {listing.transit.map((route) => (
                      <span key={route} className="block">
                        {route}
                      </span>
                    ))}
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-app text-sm font-extrabold uppercase tracking-wider">Contact</h3>
              <ul className="text-muted-app mt-1.5 space-y-1.5 text-sm">
                <li className="flex items-center gap-2">
                  <Phone size={16} weight="bold" aria-hidden="true" />
                  <a href={`tel:${listing.phone}`} className="text-app font-semibold underline">
                    {listing.phone}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <EnvelopeSimple size={16} weight="bold" aria-hidden="true" />
                  <a href={`mailto:${listing.email}`} className="text-app font-semibold underline">
                    {listing.email}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Globe size={16} weight="bold" aria-hidden="true" />
                  <span className="text-app font-semibold">{listing.website}</span>
                </li>
              </ul>
              {listing.requirements ? (
                <p className="text-muted-app mt-2 text-xs leading-snug">
                  <span className="text-app font-extrabold">What to bring: </span>
                  {listing.requirements}
                </p>
              ) : null}
            </div>
          </section>

          <div className="flex items-start gap-2 rounded-lg border border-app p-3">
            <ShieldCheck size={18} weight="bold" aria-hidden="true" className="text-accent-app mt-0.5 shrink-0" />
            <p className="text-muted-app text-xs leading-snug">
              <span className="text-app font-extrabold">Verified {listing.verifiedDate}</span> by{" "}
              {listing.verifiedBy}. Accessibility details are re-checked every 90 days. Report a mismatch and a
              coordinator responds within two business days.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t border-app surface px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => onRequest(listing)}
            className="bg-accent-app flex min-h-12 flex-1 items-center justify-center rounded-xl px-4 text-sm font-extrabold"
          >
            Request an accessible connection
          </button>
          <button
            type="button"
            onClick={() => onToggleSave(listing.id)}
            aria-pressed={saved}
            className={`flex min-h-12 items-center gap-2 rounded-xl border border-app px-3 text-sm font-bold ${
              saved ? "soft-accent" : "text-app"
            }`}
          >
            <BookmarkSimple size={18} weight={saved ? "fill" : "bold"} aria-hidden="true" />
            {saved ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => onReportBarrier(listing)}
            className="text-app flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-app px-3 text-sm font-bold sm:w-auto"
          >
            <Flag size={17} weight="bold" aria-hidden="true" />
            Report a barrier
          </button>
        </div>
      </div>
    </div>
  );
}

function SensoryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-muted rounded-lg px-2 py-2 text-center">
      <dt className="text-muted-app text-[10px] font-extrabold uppercase tracking-wide">{label}</dt>
      <dd className="text-app mt-0.5 text-sm font-extrabold">{value}</dd>
    </div>
  );
}
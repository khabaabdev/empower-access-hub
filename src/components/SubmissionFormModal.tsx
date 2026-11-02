import { useEffect, useRef, useState } from "react";
import { Check, PaperPlaneTilt, SpeakerHigh, Warning, X } from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  ACCESSIBILITY_TAGS,
  CATEGORIES,
  speakText,
  type AccessibilityTagId,
  type CategoryType,
  type ResourceListing,
} from "../data/mockData";

interface SubmissionFormModalProps {
  mode: "resource" | "connection";
  listing?: ResourceListing;
  onClose: () => void;
  onSubmitResource: (listing: ResourceListing) => void;
  onSubmitRequest: (draft: { message: string; accommodations: string }) => void;
}

const CATEGORY_IDS = CATEGORIES.map((category) => category.id);

export default function SubmissionFormModal({
  mode,
  listing,
  onClose,
  onSubmitResource,
  onSubmitRequest,
}: SubmissionFormModalProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [category, setCategory] = useState<CategoryType>("essential-services");
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [summary, setSummary] = useState("");
  const [detail, setDetail] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [tags, setTags] = useState<AccessibilityTagId[]>([]);
  const [message, setMessage] = useState("");
  const [accommodations, setAccommodations] = useState("");
  const [preferPhone, setPreferPhone] = useState(false);
  const [error, setError] = useState("");

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

  const toggleTag = (tag: AccessibilityTagId) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (mode === "connection") {
      if (message.trim().length < 10) {
        setError("Add a sentence about what you need so the coordinator can route you correctly.");
        return;
      }
      onSubmitRequest({
        message: message.trim(),
        accommodations: preferPhone
          ? `${accommodations.trim()} Please call me instead of writing back.`.trim()
          : accommodations.trim(),
      });
      return;
    }

    if (!title.trim() || !organization.trim() || summary.trim().length < 20) {
      setError("A name, an organization, and a plain-language summary of at least 20 characters are required.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const fallbackTags: AccessibilityTagId[] = tags.length > 0 ? tags : ["public-transit-adjacent"];
    const created: ResourceListing = {
      id: `community-${Date.now().toString(36)}`,
      title: title.trim(),
      organization: organization.trim(),
      category,
      description: detail.trim() || summary.trim(),
      plainSummary: summary.trim(),
      address: address.trim() || `${neighborhood.trim()}, citywide`,
      neighborhood: neighborhood.trim() || "Citywide",
      mapX: 30 + Math.round(Math.random() * 40),
      mapY: 30 + Math.round(Math.random() * 40),
      distanceMiles: 0,
      hours: hours.trim() || "Hours not confirmed yet",
      isOpenNow: false,
      phone: phone.trim() || "1-555-0100",
      email: email.trim() || "community@openaccesshub.org",
      website: "pending verification",
      accessibilityTags: fallbackTags,
      accommodations: fallbackTags.map((tag) => ({
        label: ACCESSIBILITY_TAGS.find((item) => item.id === tag)?.plain ?? "Accessibility detail to confirm",
        verified: false,
      })),
      sensoryProfile: { noise: "Medium", lighting: "Natural", crowd: "Medium" },
      transit: ["Transit details being confirmed by a coordinator"],
      requirements: "A coordinator will confirm requirements before this listing goes live.",
      contactMethod: "Coordinator follow-up within 2 business days",
      isVerified: false,
      verifiedBy: "Pending community review",
      verifiedDate: today,
      isCommunitySubmitted: true,
    };
    onSubmitResource(created);
  };

  const isConnection = mode === "connection";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close form"
        onClick={onClose}
        className="absolute inset-0 bg-[#0b1220]/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="submission-title"
        className="card-a11y relative max-h-[92dvh] w-full max-w-xl overflow-y-auto thin-scroll rounded-b-none sm:rounded-2xl"
        style={{ backgroundColor: "var(--app-surface)" }}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-app surface px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <h2 id="submission-title" className="text-app text-lg font-extrabold leading-snug">
              {isConnection ? "Request a connection" : "Add a community resource"}
            </h2>
            <p className="text-muted-app text-xs leading-snug">
              {isConnection
                ? `Tell us what you need. A coordinator replies to ${listing?.organization ?? "the organization"} on your behalf.`
                : "Share a free service or flexible opportunity. A coordinator verifies access details within 2 business days."}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="card-a11y text-app flex h-11 w-11 shrink-0 items-center justify-center"
          >
            <X size={20} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
          {isConnection && listing ? (
            <div className="soft-accent rounded-xl p-3">
              <p className="text-xs font-extrabold uppercase tracking-wider">{listing.organization}</p>
              <p className="mt-0.5 text-sm font-bold">{listing.title}</p>
              <button
                type="button"
                onClick={() => speakText(listing.plainSummary)}
                className="mt-2 flex items-center gap-1.5 text-xs font-extrabold underline"
              >
                <SpeakerHigh size={14} weight="bold" aria-hidden="true" />
                Hear the summary again
              </button>
            </div>
          ) : null}

          {isConnection ? (
            <>
              <Field label="What do you need help with?" hint="Required. Plain words are perfect.">
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={4}
                  placeholder="I use a wheelchair and need a step-free entrance. I would like to start a shift next week."
                  className="text-app surface-muted w-full rounded-xl border border-app p-3 text-sm"
                />
              </Field>
              <Field label="Accommodations I want them to know" hint="Optional, but helps the coordinator advocate for you.">
                <textarea
                  value={accommodations}
                  onChange={(event) => setAccommodations(event.target.value)}
                  rows={3}
                  placeholder="I need written instructions, a quiet room, and breaks every hour."
                  className="text-app surface-muted w-full rounded-xl border border-app p-3 text-sm"
                />
              </Field>
              <ToggleRow
                label="Call me instead of writing back"
                hint="Best if reading long messages is tiring."
                checked={preferPhone}
                onChange={setPreferPhone}
              />
            </>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Resource name" hint="Required">
                  <TextInput value={title} onChange={setTitle} placeholder="Friday Night Community Dinner" />
                </Field>
                <Field label="Organization" hint="Required">
                  <TextInput value={organization} onChange={setOrganization} placeholder="St. Mark's Kitchen" />
                </Field>
                <Field label="Category">
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value as CategoryType)}
                    className="text-app surface-muted h-12 w-full rounded-xl border border-app px-3 text-sm"
                  >
                    {CATEGORY_IDS.map((id) => (
                      <option key={id} value={id}>
                        {CATEGORIES.find((item) => item.id === id)?.label ?? id}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Neighborhood">
                  <TextInput value={neighborhood} onChange={setNeighborhood} placeholder="Eastbank" />
                </Field>
              </div>

              <Field label="Street address" hint="Optional for remote or phones-only services">
                <TextInput value={address} onChange={setAddress} placeholder="18 Foundry Way, Eastbank" />
              </Field>

              <Field label="Plain-language summary" hint="Required. Written for someone tired and stressed.">
                <textarea
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  rows={3}
                  placeholder="Free hot dinner every Friday. No ID needed. Wheelchair ramp at the side door."
                  className="text-app surface-muted w-full rounded-xl border border-app p-3 text-sm"
                />
              </Field>

              <Field label="More detail" hint="Optional: what happens, who helps, what to expect.">
                <textarea
                  value={detail}
                  onChange={(event) => setDetail(event.target.value)}
                  rows={2}
                  className="text-app surface-muted w-full rounded-xl border border-app p-3 text-sm"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Hours" hint="Optional">
                  <TextInput value={hours} onChange={setHours} placeholder="Fridays 6:00 PM - 8:00 PM" />
                </Field>
                <Field label="Phone" hint="Optional">
                  <TextInput value={phone} onChange={setPhone} placeholder="1-555-0142" />
                </Field>
              </div>

              <Field label="Contact email" hint="Optional">
                <TextInput value={email} onChange={setEmail} placeholder="hello@example.org" />
              </Field>

              <fieldset>
                <legend className="text-app mb-2 text-sm font-extrabold">Accessibility offered</legend>
                <div className="flex flex-wrap gap-2">
                  {ACCESSIBILITY_TAGS.map((tag) => {
                    const active = tags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleTag(tag.id)}
                        className={`flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-xs font-bold ${
                          active ? "border-[var(--app-accent)] soft-accent" : "border-app text-app surface"
                        }`}
                      >
                        {active ? <Check size={13} weight="bold" aria-hidden="true" /> : null}
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </>
          )}

          {error ? (
            <p className="warn-accent flex items-start gap-2 rounded-lg p-3 text-xs font-bold" role="alert">
              <Warning size={16} weight="bold" aria-hidden="true" className="mt-0.5 shrink-0" />
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2 border-t border-app pt-4">
            <button
              type="submit"
              className="bg-accent-app flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold"
            >
              <PaperPlaneTilt size={18} weight="bold" aria-hidden="true" />
              {isConnection ? "Send request" : "Submit for verification"}
            </button>
            <button
              type="button"
              onClick={() => {
                toast("Nothing sent", { description: "You can close this form whenever you are ready." });
                onClose();
              }}
              className="text-app min-h-12 rounded-xl border border-app px-4 text-sm font-bold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-app block text-sm font-extrabold">{label}</span>
      {hint ? <span className="text-muted-app mb-1 block text-[11px] font-semibold">{hint}</span> : null}
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="text-app surface-muted mt-1 h-12 w-full rounded-xl border border-app px-3 text-sm"
    />
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="card-a11y flex w-full items-start gap-3 p-3 text-left"
    >
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
          checked ? "border-[var(--app-accent)] bg-[var(--app-accent)]" : "border-app"
        }`}
      >
        {checked ? <Check size={14} weight="bold" color="#ffffff" /> : null}
      </span>
      <span>
        <span className="text-app block text-sm font-bold leading-tight">{label}</span>
        <span className="text-muted-app block text-xs leading-snug">{hint}</span>
      </span>
    </button>
  );
}
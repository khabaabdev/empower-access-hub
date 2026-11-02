import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import {
  ArrowRight,
  CheckCircle,
  Heart,
  IdentificationCard,
  Lifebuoy,
  MagicWand,
  Phone,
  ShieldCheck,
  Sparkle,
  UsersThree,
  WarningCircle,
  Wheelchair,
  X,
} from "@phosphor-icons/react";
import Navbar from "./components/Navbar";
import DiscoveryDashboard from "./components/DiscoveryDashboard";
import ListingDetailModal from "./components/ListingDetailModal";
import SubmissionFormModal from "./components/SubmissionFormModal";
import SavedRequestCenter from "./components/SavedRequestCenter";
import AccessibilityPassportModal from "./components/AccessibilityPassportModal";
import BarrierReportModal from "./components/BarrierReportModal";
import DocumentScanner from "./components/DocumentScanner";
import TransitPlanner from "./components/TransitPlanner";
import EmergencyPocketKit from "./components/EmergencyPocketKit";
import CommunityAuditor from "./components/CommunityAuditor";
import MatchWizardModal from "./components/MatchWizardModal";
import { SEED_LISTINGS } from "./data/listings";
import {
  EMERGENCY_LINES,
  barrierTypeLabel,
  defaultPassport,
  speakText,
  type AccessibilityPassport,
  type AccessibilityPreferences,
  type BarrierReport,
  type BarrierType,
  type ConnectionRequest,
  type ResourceListing,
  type ViewKey,
} from "./data/mockData";

const DEFAULT_PREFS: AccessibilityPreferences = {
  fontScale: "normal",
  highContrast: false,
  sensoryCalm: false,
  dyslexiaFont: false,
  voiceReader: true,
  theme: "light",
};

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [view, setView] = useState<ViewKey>("directory");
  const [prefs, setPrefs] = useState<AccessibilityPreferences>(() => ({
    ...DEFAULT_PREFS,
    ...readStored<Partial<AccessibilityPreferences>>("oah:prefs", {}),
  }));
  const [savedIds, setSavedIds] = useState<string[]>(() => readStored<string[]>("oah:saved", []));
  const [requests, setRequests] = useState<ConnectionRequest[]>(() =>
    readStored<ConnectionRequest[]>("oah:requests", []),
  );
  const [communityListings, setCommunityListings] = useState<ResourceListing[]>(() =>
    readStored<ResourceListing[]>("oah:community", []),
  );
  const [selected, setSelected] = useState<ResourceListing | null>(null);
  const [formMode, setFormMode] = useState<"resource" | "connection" | null>(null);
  const [requestTarget, setRequestTarget] = useState<ResourceListing | null>(null);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [passport, setPassport] = useState<AccessibilityPassport>(() =>
    readStored<AccessibilityPassport>("oah:passport", defaultPassport()),
  );
  const [passportOpen, setPassportOpen] = useState(false);
  const [barrierReports, setBarrierReports] = useState<BarrierReport[]>(() =>
    readStored<BarrierReport[]>("oah:barriers", []),
  );
  const [barrierTarget, setBarrierTarget] = useState<ResourceListing | null>(null);
  const [auditorOpen, setAuditorOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const directoryRef = useRef<HTMLDivElement | null>(null);

  const listings = useMemo(() => [...communityListings, ...SEED_LISTINGS], [communityListings]);
  const savedListings = useMemo(
    () => listings.filter((listing) => savedIds.includes(listing.id)),
    [listings, savedIds],
  );

  useEffect(() => {
    window.localStorage.setItem("oah:prefs", JSON.stringify(prefs));
    const root = document.documentElement;
    root.dataset.fontscale = prefs.fontScale;
    root.dataset.theme = prefs.theme ?? "light";
    root.dataset.contrast = prefs.highContrast ? "high" : "normal";
    root.dataset.dyslexic = String(prefs.dyslexiaFont);
    root.dataset.calm = String(prefs.sensoryCalm);
  }, [prefs]);

  useEffect(() => {
    window.localStorage.setItem("oah:saved", JSON.stringify(savedIds));
  }, [savedIds]);

  useEffect(() => {
    window.localStorage.setItem("oah:requests", JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    window.localStorage.setItem("oah:community", JSON.stringify(communityListings));
  }, [communityListings]);

  useEffect(() => {
    window.localStorage.setItem("oah:passport", JSON.stringify(passport));
  }, [passport]);

  useEffect(() => {
    window.localStorage.setItem("oah:barriers", JSON.stringify(barrierReports));
  }, [barrierReports]);

  // Switching tabs presents the selected page cleanly from the very top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [view]);

  const savePassport = useCallback((next: AccessibilityPassport) => {
    setPassport(next);
    toast.success("Accessibility passport saved", {
      description: "It stays on this device and is ready to share or read aloud.",
    });
  }, []);

  const handleBarrierSubmit = (type: BarrierType, detail: string) => {
    if (!barrierTarget) return;
    const created: BarrierReport = {
      id: `bar-${Date.now().toString(36)}`,
      listingId: barrierTarget.id,
      listingTitle: barrierTarget.title,
      type,
      detail,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      status: "sent",
    };
    setBarrierReports((prev) => [created, ...prev]);
    toast.success("Barrier report sent", {
      description: `A coordinator re-checks "${barrierTarget.title}" within two business days.`,
    });
    setBarrierTarget(null);
    setSelected(null);
  };

  const updatePrefs = useCallback((patch: Partial<AccessibilityPreferences>) => {
    setPrefs((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggleSave = useCallback((id: string) => {
    setSavedIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        toast("Removed from saved", { description: "You can bookmark it again any time." });
        return prev.filter((item) => item !== id);
      }
      toast.success("Saved for later", { description: "Find it under My connections." });
      return [...prev, id];
    });
  }, []);

  const openDirectory = () => {
    setView("directory");
    window.setTimeout(() => directoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  const handleRequestSubmit = ({ message, accommodations }: { message: string; accommodations: string }) => {
    if (!requestTarget) return;
    const created: ConnectionRequest = {
      id: `req-${Date.now().toString(36)}`,
      listingId: requestTarget.id,
      listingTitle: requestTarget.title,
      organization: requestTarget.organization,
      message,
      accommodations,
      status: "submitted",
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
    setRequests((prev) => [created, ...prev]);
    setFormMode(null);
    setRequestTarget(null);
    setSelected(null);
    setView("saved");
    toast.success("Request sent", {
      description: `A coordinator will contact ${requestTarget.organization} on your behalf.`,
    });
  };

  const handleResourceSubmit = (listing: ResourceListing) => {
    setCommunityListings((prev) => [listing, ...prev]);
    setFormMode(null);
    toast.success("Thank you for adding this", {
      description: "It appears in the directory marked as awaiting verification.",
    });
    openDirectory();
  };

  const withdrawRequest = (id: string) => {
    setRequests((prev) => prev.filter((request) => request.id !== id));
    toast("Request withdrawn", { description: "Nothing else is needed from you." });
  };

  const stats = [
    { value: String(listings.length), label: "verified listings" },
    { value: "10", label: "accessibility tags" },
    { value: "2 days", label: "average reply" },
    { value: "No account", label: "ever required" },
  ];

  return (
    <div className="app-shell flex min-h-dvh flex-col">
      <Toaster position="top-center" richColors closeButton />

      <Navbar
        view={view}
        onViewChange={setView}
        savedCount={savedIds.length}
        onOpenSubmit={() => setFormMode("resource")}
        prefs={prefs}
        onUpdatePrefs={updatePrefs}
      />

      {/* Crisis strip */}
      <div className="border-b border-app surface-muted">
        <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-app flex items-center gap-1.5 text-xs font-extrabold">
              <Phone size={15} weight="bold" aria-hidden="true" />
              Need help right now?
            </p>
            <p className="text-muted-app text-xs font-semibold">
              988 Suicide &amp; Crisis Lifeline · call or text 988 · 24/7 · free
            </p>
            <button
              type="button"
              onClick={() => setCrisisOpen((open) => !open)}
              aria-expanded={crisisOpen}
              className="text-app ml-auto flex min-h-9 items-center gap-1 rounded-lg border border-app px-2.5 text-[11px] font-extrabold"
            >
              {crisisOpen ? "Hide lines" : "All support lines"}
              {crisisOpen ? <X size={13} weight="bold" aria-hidden="true" /> : <ArrowRight size={13} weight="bold" aria-hidden="true" />}
            </button>
          </div>
          {crisisOpen ? (
            <ul className="mt-2 grid gap-2 pb-2 sm:grid-cols-2 lg:grid-cols-4">
              {EMERGENCY_LINES.map((line) => (
                <li key={line.name} className="card-a11y p-3">
                  <p className="text-app text-xs font-extrabold">{line.name}</p>
                  <p className="text-muted-app mt-0.5 text-[11px] leading-snug">{line.detail}</p>
                  <a
                    href={`tel:${line.phone}`}
                    className="text-accent-app mt-1.5 inline-block text-xs font-extrabold underline"
                  >
                    {line.phone}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <main id="main-content" className="flex-1">
        {view === "directory" ? (
          <>
        {/* Hero */}
        <section className="border-b border-app surface">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <span className="soft-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider">
                  <Sparkle size={14} weight="bold" aria-hidden="true" />
                  Free · verified · barrier-free
                </span>
                <h1 className="text-app mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                  Resources that meet you where you are.
                </h1>
                <p className="text-muted-app mt-3 max-w-xl text-base leading-relaxed sm:text-lg">
                  Find verified free services and flexible, accommodated work near you. Filter by what you
                  actually need, read every listing in plain language, and ask a coordinator to make the
                  introduction for you.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={openDirectory}
                    className="bg-accent-app flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold"
                  >
                    Find resources near me
                    <ArrowRight size={18} weight="bold" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => speakText("OpenAccess Hub. Free verified services and accommodated work, filtered by the accessibility you need.")}
                    className="text-app flex min-h-12 items-center justify-center gap-2 rounded-xl border border-app px-5 text-sm font-bold"
                  >
                    <Wheelchair size={18} weight="bold" aria-hidden="true" />
                    Hear how this works
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassportOpen(true)}
                    className="text-app flex min-h-12 items-center justify-center gap-2 rounded-xl border border-app px-5 text-sm font-bold"
                  >
                    <IdentificationCard size={18} weight="bold" aria-hidden="true" />
                    {passport.updatedAt ? "My access passport" : "Create access passport"}
                  </button>
                </div>
                <dl className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="card-a11y px-3 py-2">
                      <dt className="text-muted-app text-[10px] font-extrabold uppercase tracking-wider">
                        {stat.label}
                      </dt>
                      <dd className="text-app text-lg font-extrabold leading-tight">{stat.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="card-a11y p-4 sm:p-5">
                <p className="text-app flex items-center gap-2 text-sm font-extrabold">
                  <ShieldCheck size={18} weight="bold" aria-hidden="true" className="text-accent-app" />
                  How verification works
                </p>
                <ul className="mt-3 space-y-3">
                  {[
                    { title: "A local coordinator visits or calls", body: "Access details are checked against the building, not a brochure." },
                    { title: "Every access tag has a note", body: "Ramp, quiet room, ASL interpreter, no-ID policy: recorded in plain language." },
                    { title: "Re-checked every 90 days", body: "If something changed, the listing is flagged until it is confirmed again." },
                  ].map((step) => (
                    <li key={step.title} className="flex items-start gap-2">
                      <CheckCircle size={17} weight="bold" aria-hidden="true" className="text-accent-app mt-0.5 shrink-0" />
                      <span>
                        <span className="text-app block text-sm font-bold leading-snug">{step.title}</span>
                        <span className="text-muted-app block text-xs leading-snug">{step.body}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-app p-3">
                  <Heart size={16} weight="bold" aria-hidden="true" className="text-accent-app mt-0.5 shrink-0" />
                  <p className="text-muted-app text-[11px] leading-snug">
                    No account, no ID, no income questions. Saved items and requests stay on this device.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {passport.updatedAt || barrierReports.length > 0 ? (
          <section className="border-b border-app surface-muted">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
              {passport.updatedAt ? (
                <button
                  type="button"
                  onClick={() => setPassportOpen(true)}
                  className="soft-accent flex min-h-10 items-center gap-2 rounded-full px-3 text-xs font-extrabold"
                >
                  <IdentificationCard size={15} weight="bold" aria-hidden="true" />
                  Access passport ready
                </button>
              ) : null}
              {barrierReports.length > 0 ? (
                <span className="text-muted-app flex items-center gap-1.5 text-xs font-bold">
                  <WarningCircle size={14} weight="bold" aria-hidden="true" />
                  {barrierReports.length} barrier {barrierReports.length === 1 ? "report" : "reports"} filed
                </span>
              ) : null}
              {passport.name ? (
                <span className="text-muted-app text-xs font-semibold">Sharing as {passport.name}</span>
              ) : null}
            </div>
          </section>
        ) : null}
          </>
        ) : null}

        <div ref={directoryRef}>
          {view === "directory" ? (
            <div className="pt-8">
              <DiscoveryDashboard
                listings={listings}
                savedIds={savedIds}
                onToggleSave={toggleSave}
                onSelect={setSelected}
                voiceReader={prefs.voiceReader}
              />
            </div>
          ) : view === "scanner" ? (
            <DocumentScanner listings={listings} />
          ) : view === "transit" ? (
            <TransitPlanner />
          ) : view === "emergency" ? (
            <EmergencyPocketKit passport={passport} savedListings={savedListings} />
          ) : (
            <div className="pt-8">
              <SavedRequestCenter
                savedListings={savedListings}
                requests={requests}
                onOpenListing={setSelected}
                onRemoveSaved={toggleSave}
                onWithdrawRequest={withdrawRequest}
                onBrowse={openDirectory}
              />
            </div>
          )}
        </div>
      </main>

      {/* Floating quick-action bar */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3">
        <div className="card-a11y surface pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-1 rounded-2xl p-1.5 shadow-lg">
          <button type="button" onClick={() => setWizardOpen(true)} className="bg-accent-app flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-extrabold">
            <MagicWand size={17} weight="bold" aria-hidden="true" />
            Find my fit
          </button>
          <button type="button" onClick={() => setAuditorOpen(true)} className="text-app flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-extrabold">
            <UsersThree size={17} weight="bold" aria-hidden="true" />
            <span className="hidden sm:inline">Live audits</span>
            <span className="sm:hidden">Audits</span>
          </button>
          <button type="button" onClick={() => setView("emergency")} className="text-app flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-extrabold">
            <Lifebuoy size={17} weight="bold" aria-hidden="true" />
            <span className="hidden sm:inline">Emergency kit</span>
            <span className="sm:hidden">Kit</span>
          </button>
        </div>
      </div>

      <footer className="border-t border-app surface">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 pb-24 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-app flex items-center gap-2 text-sm font-extrabold">
              <span className="bg-accent-app flex h-8 w-8 items-center justify-center rounded-lg">
                <Wheelchair size={17} weight="bold" aria-hidden="true" />
              </span>
              OpenAccess Hub
            </p>
            <p className="text-muted-app mt-2 max-w-sm text-xs leading-relaxed">
              A barrier-free directory built with low-income residents, neurodivergent job seekers and people
              with physical disabilities. Every interaction works with a keyboard, a screen reader and a slow
              connection.
            </p>
          </div>
          <div>
            <p className="text-app text-xs font-extrabold uppercase tracking-wider">Accessibility promise</p>
            <ul className="text-muted-app mt-2 space-y-1 text-xs leading-snug">
              <li>Text size, contrast and calm mode controls</li>
              <li>Plain-language summaries on every listing</li>
              <li>Listen-aloud on cards and details</li>
              <li>No account, no ID, no tracking</li>
            </ul>
          </div>
          <div>
            <p className="text-app text-xs font-extrabold uppercase tracking-wider">Corrections</p>
            <p className="text-muted-app mt-2 text-xs leading-relaxed">
              Found an entrance that is not step-free or hours that changed? Add a note with Share a resource and
              a coordinator re-checks it within two business days.
            </p>
            <button
              type="button"
              onClick={() => setFormMode("resource")}
              className="text-app mt-3 flex min-h-10 items-center gap-1.5 rounded-lg border border-app px-3 text-xs font-extrabold"
            >
              Share a resource
              <ArrowRight size={14} weight="bold" aria-hidden="true" />
            </button>
          </div>
        </div>
      </footer>

      {selected ? (
        <ListingDetailModal
          listing={selected}
          saved={savedIds.includes(selected.id)}
          onToggleSave={toggleSave}
          onClose={() => setSelected(null)}
          onRequest={(listing) => {
            setRequestTarget(listing);
            setFormMode("connection");
          }}
          onReportBarrier={(listing) => setBarrierTarget(listing)}
        />
      ) : null}

      {barrierTarget ? (
        <BarrierReportModal
          listing={barrierTarget}
          onClose={() => setBarrierTarget(null)}
          onSubmit={handleBarrierSubmit}
        />
      ) : null}

      {passportOpen ? (
        <AccessibilityPassportModal
          passport={passport}
          onSave={savePassport}
          onClose={() => setPassportOpen(false)}
        />
      ) : null}

      {formMode ? (
        <SubmissionFormModal
          mode={formMode}
          listing={formMode === "connection" ? requestTarget ?? undefined : undefined}
          onClose={() => {
            setFormMode(null);
            setRequestTarget(null);
          }}
          onSubmitResource={handleResourceSubmit}
          onSubmitRequest={handleRequestSubmit}
        />
      ) : null}

      <CommunityAuditor open={auditorOpen} onClose={() => setAuditorOpen(false)} />

      <MatchWizardModal
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        listings={listings}
        onOpenListing={setSelected}
      />
    </div>
  );
}
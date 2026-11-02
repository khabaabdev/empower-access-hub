import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Plus,
  SealCheck,
  UsersThree,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  AUDIT_ASPECT_LABEL,
  AUDIT_STATUS_META,
  SEED_AUDITS,
  type AuditAspect,
  type AuditCheckIn,
  type AuditStatus,
} from "../data/mockData";

const STORAGE_KEY = "oah_community_audits";

function statusTone(status: AuditStatus): string {
  const tone = AUDIT_STATUS_META[status].tone;
  if (tone === "good") return "soft-accent";
  if (tone === "warn") return "warn-accent";
  return "warn-accent";
}

function loadAudits(): AuditCheckIn[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_AUDITS;
    const parsed = JSON.parse(raw) as AuditCheckIn[];
    return Array.isArray(parsed) && parsed.length ? parsed : SEED_AUDITS;
  } catch {
    return SEED_AUDITS;
  }
}

interface CommunityAuditorProps {
  open: boolean;
  onClose: () => void;
  defaultLocation?: string;
}

export default function CommunityAuditor({ open, onClose, defaultLocation = "" }: CommunityAuditorProps) {
  const [audits, setAudits] = useState<AuditCheckIn[]>(SEED_AUDITS);
  const [showForm, setShowForm] = useState(false);
  const [location, setLocation] = useState(defaultLocation);
  const [aspect, setAspect] = useState<AuditAspect>("entry");
  const [status, setStatus] = useState<AuditStatus>("working");
  const [note, setNote] = useState("");

  useEffect(() => {
    setAudits(loadAudits());
  }, []);

  useEffect(() => {
    if (open) setLocation(defaultLocation);
  }, [open, defaultLocation]);

  const persist = (next: AuditCheckIn[]) => {
    setAudits(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
  };

  const submit = () => {
    if (!location.trim()) {
      toast.error("Add the place name first");
      return;
    }
    const entry: AuditCheckIn = {
      id: `u-${Date.now()}`,
      location: location.trim(),
      aspect,
      status,
      note: note.trim() || AUDIT_ASPECT_LABEL[aspect],
      reporter: "you",
      confidence: status === "working" ? 100 : status === "partial" ? 70 : 55,
      ago: "just now",
      verified: status === "working",
    };
    persist([entry, ...audits]);
    setNote("");
    setShowForm(false);
    toast.success("Check-in posted", { description: "Thanks for keeping the ledger live." });
  };

  const working = useMemo(() => audits.filter((a) => a.status === "working").length, [audits]);
  const blocked = useMemo(() => audits.filter((a) => a.status === "blocked").length, [audits]);

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
          aria-label="Community access auditor"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="card-a11y surface flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-app p-4">
              <div className="flex items-center gap-2">
                <UsersThree size={22} weight="bold" aria-hidden="true" className="text-accent-app" />
                <div>
                  <p className="text-app text-base font-extrabold">Live access auditor</p>
                  <p className="text-muted-app text-xs">Crowd-verified ramps, elevators, noise and interpreters</p>
                </div>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="text-app flex h-10 w-10 items-center justify-center rounded-lg border border-app">
                <X size={18} weight="bold" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-3 border-b border-app px-4 py-2 text-xs font-bold">
              <span className="soft-accent rounded-full px-2.5 py-1">{working} working</span>
              <span className="warn-accent rounded-full px-2.5 py-1">{blocked} blocked</span>
              <button
                type="button"
                onClick={() => setShowForm((s) => !s)}
                className="bg-accent-app ml-auto flex min-h-9 items-center gap-1.5 rounded-lg px-3 font-extrabold"
              >
                <Plus size={16} weight="bold" aria-hidden="true" />
                Check in
              </button>
            </div>

            <AnimatePresence>
              {showForm ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-app"
                >
                  <div className="space-y-2 p-4">
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Place name (e.g. Eastside Pantry)"
                      className="text-app surface-muted w-full rounded-lg border border-app px-3 py-2 text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-app text-xs font-bold">
                        What did you check?
                        <select
                          value={aspect}
                          onChange={(e) => setAspect(e.target.value as AuditAspect)}
                          className="text-app surface-muted mt-1 w-full rounded-lg border border-app px-2 py-2 text-sm"
                        >
                          {(Object.keys(AUDIT_ASPECT_LABEL) as AuditAspect[]).map((k) => (
                            <option key={k} value={k}>{AUDIT_ASPECT_LABEL[k]}</option>
                          ))}
                        </select>
                      </label>
                      <label className="text-app text-xs font-bold">
                        Status
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as AuditStatus)}
                          className="text-app surface-muted mt-1 w-full rounded-lg border border-app px-2 py-2 text-sm"
                        >
                          {(Object.keys(AUDIT_STATUS_META) as AuditStatus[]).map((k) => (
                            <option key={k} value={k}>{AUDIT_STATUS_META[k].label}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      placeholder="Short note for others (optional)"
                      className="text-app surface-muted w-full rounded-lg border border-app px-3 py-2 text-sm"
                    />
                    <button type="button" onClick={submit} className="bg-accent-app min-h-11 w-full rounded-xl text-sm font-extrabold">
                      Post check-in
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="thin-scroll flex-1 overflow-y-auto p-4">
              <ul className="space-y-2">
                {audits.map((a) => (
                  <li key={a.id} className="card-a11y p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-app text-sm font-extrabold">{a.location}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-extrabold ${statusTone(a.status)}`}>
                        {AUDIT_STATUS_META[a.status].label}
                      </span>
                    </div>
                    <p className="text-muted-app mt-0.5 text-xs font-bold uppercase tracking-wider">{AUDIT_ASPECT_LABEL[a.aspect]}</p>
                    <p className="text-muted-app mt-1 text-sm leading-snug">{a.note}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-bold">
                      <span className="text-muted-app flex items-center gap-1">
                        <Clock size={12} weight="bold" aria-hidden="true" />
                        {a.ago}
                      </span>
                      <span className="text-muted-app">by {a.reporter}</span>
                      <span className="soft-accent flex items-center gap-1 rounded-full px-2 py-0.5">
                        {a.confidence}% confidence
                      </span>
                      {a.verified ? (
                        <span className="text-accent-app flex items-center gap-1">
                          <SealCheck size={13} weight="bold" aria-hidden="true" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-muted-app flex items-center gap-1">
                          <WarningCircle size={13} weight="bold" aria-hidden="true" />
                          Unverified
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <p className="text-muted-app mt-3 flex items-center gap-1.5 text-xs">
                <CheckCircle size={14} weight="bold" aria-hidden="true" className="text-accent-app" />
                Reports are stored on this device only. No account, no tracking.
              </p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

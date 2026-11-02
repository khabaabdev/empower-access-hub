import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  DownloadSimple,
  IdentificationCard,
  Lifebuoy,
  Phone,
  Printer,
  ShieldCheck,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  EMERGENCY_LINES,
  passportLineText,
  type AccessibilityPassport,
  type ResourceListing,
} from "../data/mockData";

const NL = String.fromCharCode(10);

interface EmergencyPocketKitProps {
  passport: AccessibilityPassport;
  savedListings: ResourceListing[];
}

export default function EmergencyPocketKit({ passport, savedListings }: EmergencyPocketKitProps) {
  const [picked, setPicked] = useState<ResourceListing[]>(savedListings.slice(0, 3));
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => new Set(picked.map((p) => p.id)));

  const togglePick = (r: ResourceListing) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(r.id)) next.delete(r.id);
      else next.add(r.id);
      setPicked(savedListings.filter((s) => next.has(s.id)));
      return next;
    });
  };

  const kitText = useMemo(() => {
    const lines: string[] = [];
    lines.push("OPENACCESS HUB - EMERGENCY POCKET KIT");
    lines.push("");
    if (passport.name) lines.push(`Name: ${passport.name}`);
    const pLine = passportLineText(passport);
    if (pLine) lines.push(`Access needs: ${pLine}`);
    lines.push("");
    lines.push("CRISIS LINES:");
    for (const l of EMERGENCY_LINES) lines.push(`- ${l.name}: ${l.phone} (${l.detail})`);
    lines.push("");
    if (picked.length) {
      lines.push("MY SAVED RESOURCES:");
      for (const r of picked) lines.push(`- ${r.title}, ${r.organization}: ${r.phone} | ${r.address}`);
    }
    lines.push("");
    lines.push("Generated on this device. No account, no tracking.");
    return lines.join(NL);
  }, [passport, picked]);

  const download = () => {
    try {
      const blob = new Blob([kitText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "openaccess-emergency-kit.txt";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Kit downloaded", { description: "Keep the text file on your phone." });
    } catch {
      toast.error("Download blocked on this device");
    }
  };

  return (
    <section className="border-b border-app surface">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex items-center gap-2">
          <Lifebuoy size={24} weight="bold" aria-hidden="true" className="text-accent-app" />
          <div>
            <h2 className="text-app text-xl font-extrabold tracking-tight sm:text-2xl">Emergency Pocket Kit</h2>
            <p className="text-muted-app text-sm">
              One printable wallet card with your access needs, crisis lines and the places you trust.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <div className="printable card-a11y p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-app pb-2">
              <p className="text-app flex items-center gap-1.5 text-sm font-extrabold">
                <IdentificationCard size={16} weight="bold" aria-hidden="true" className="text-accent-app" />
                Access wallet card
              </p>
              <span className="soft-accent rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase">
                Keep with you
              </span>
            </div>

            <div className="mt-3 space-y-3 text-sm">
              <div>
                <p className="text-muted-app text-[10px] font-extrabold uppercase tracking-wider">Name</p>
                <p className="text-app font-bold">{passport.name || "Add your name in your passport"}</p>
              </div>
              <div>
                <p className="text-muted-app text-[10px] font-extrabold uppercase tracking-wider">Access needs</p>
                <p className="text-app leading-snug">{passportLineText(passport) || "No needs recorded yet."}</p>
              </div>
              <div>
                <p className="text-muted-app text-[10px] font-extrabold uppercase tracking-wider">Crisis lines</p>
                <ul className="mt-1 space-y-1">
                  {EMERGENCY_LINES.map((l) => (
                    <li key={l.name} className="flex items-center gap-1.5">
                      <Phone size={13} weight="bold" aria-hidden="true" className="text-accent-app shrink-0" />
                      <span className="text-app font-bold">{l.phone}</span>
                      <span className="text-muted-app truncate text-xs">{l.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {picked.length ? (
                <div>
                  <p className="text-muted-app text-[10px] font-extrabold uppercase tracking-wider">Places I trust</p>
                  <ul className="mt-1 space-y-1">
                    {picked.map((r) => (
                      <li key={r.id} className="text-app text-xs leading-snug">
                        <span className="font-bold">{r.title}</span>
                        <span className="text-muted-app"> · {r.phone}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <p className="text-muted-app flex items-center gap-1 border-t border-app pt-2 text-[10px] font-bold">
                <ShieldCheck size={12} weight="bold" aria-hidden="true" />
                Stored on this device only. No account, no tracking.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card-a11y p-4">
              <p className="text-app text-sm font-extrabold">Choose which saved places to include</p>
              {savedListings.length ? (
                <ul className="thin-scroll mt-3 max-h-64 space-y-1.5 overflow-y-auto">
                  {savedListings.map((r) => {
                    const on = checkedIds.has(r.id);
                    return (
                      <li key={r.id}>
                        <button
                          type="button"
                          onClick={() => togglePick(r)}
                          aria-pressed={on}
                          className={`flex min-h-11 w-full items-center gap-2 rounded-lg border-2 px-3 text-left text-sm transition-colors ${
                            on ? "border-[var(--app-accent)] soft-accent" : "border-app card-a11y"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${on ? "border-[var(--app-accent)] bg-[var(--app-accent)]" : "border-app"}`}
                          >
                            {on ? <Check size={13} weight="bold" color="#ffffff" /> : null}
                          </span>
                          <span className="min-w-0">
                            <span className="text-app block truncate font-bold">{r.title}</span>
                            <span className="text-muted-app block truncate text-xs">{r.phone}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-muted-app mt-2 text-sm">
                  You have no saved places yet. Save a listing from the directory to add it here.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-accent-app flex min-h-12 items-center gap-2 rounded-xl px-5 text-sm font-extrabold"
              >
                <Printer size={18} weight="bold" aria-hidden="true" />
                Print wallet card
              </button>
              <button
                type="button"
                onClick={download}
                className="text-app flex min-h-12 items-center gap-2 rounded-xl border border-app px-5 text-sm font-extrabold"
              >
                <DownloadSimple size={18} weight="bold" aria-hidden="true" />
                Download .txt
              </button>
            </div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted-app text-xs leading-snug">
              Everything here is generated locally. The printed card fits a wallet sleeve, and the text file works
              offline on any phone.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}

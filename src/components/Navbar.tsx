import { useState } from "react";
import { BookmarkSimple, Brain, Bus, Check, Lifebuoy, Moon, Plus, SquaresFour, Sun, TextAa, Wheelchair, X } from "@phosphor-icons/react";
import type { AccessibilityPreferences, ViewKey } from "../data/mockData";

interface NavbarProps {
  view: ViewKey;
  onViewChange: (view: ViewKey) => void;
  savedCount: number;
  onOpenSubmit: () => void;
  prefs: AccessibilityPreferences;
  onUpdatePrefs: (patch: Partial<AccessibilityPreferences>) => void;
}

const FONT_STEPS: { id: AccessibilityPreferences["fontScale"]; label: string }[] = [
  { id: "normal", label: "Aa" },
  { id: "large", label: "Aa+" },
  { id: "xlarge", label: "Aa++" },
];

export default function Navbar({ view, onViewChange, savedCount, onOpenSubmit, prefs, onUpdatePrefs }: NavbarProps) {
  const [panelOpen, setPanelOpen] = useState(false);

  const tabs: { id: ViewKey; label: string; count?: number; icon: typeof SquaresFour }[] = [
    { id: "directory", label: "Directory", icon: SquaresFour },
    { id: "scanner", label: "Scanner", icon: Brain },
    { id: "transit", label: "Transit", icon: Bus },
    { id: "emergency", label: "Emergency kit", icon: Lifebuoy },
    { id: "saved", label: "My connections", count: savedCount, icon: BookmarkSimple },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-app surface backdrop-blur">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="bg-accent-app flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <Wheelchair size={22} weight="bold" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-app truncate text-base font-extrabold leading-tight tracking-tight">
              OpenAccess Hub
            </p>
            <p className="text-muted-app truncate text-xs leading-tight">
              Barrier-free local resources
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPanelOpen((open) => !open)}
            aria-expanded={panelOpen}
            aria-controls="a11y-panel"
            className="card-a11y text-app flex min-h-11 items-center gap-2 px-3 text-sm font-semibold hover:surface-muted"
          >
            <TextAa size={20} weight="bold" aria-hidden="true" />
            <span className="hidden sm:inline">Accessibility</span>
            <span className="sm:hidden">A11y</span>
          </button>
          <button
            type="button"
            onClick={onOpenSubmit}
            className="bg-accent-app flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold"
          >
            <Plus size={18} weight="bold" aria-hidden="true" />
            <span className="hidden sm:inline">Share a resource</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        <nav aria-label="Primary" className="order-last flex w-full items-center gap-1 border-t border-app pt-2 sm:order-none sm:w-auto sm:border-0 sm:pt-0">
          {tabs.map((tab) => {
            const active = view === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onViewChange(tab.id)}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-bold transition-colors ${
                  active ? "soft-accent" : "text-muted-app hover:surface-muted"
                }`}
              >
                <Icon size={18} weight="bold" aria-hidden="true" />
                {tab.label}
                {typeof tab.count === "number" && tab.count > 0 ? (
                  <span className="rounded-full bg-[var(--app-accent)] px-1.5 py-0.5 text-[11px] font-extrabold text-white">
                    {tab.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {panelOpen ? (
        <div id="a11y-panel" className="border-t border-app surface-muted">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
            <fieldset>
              <legend className="text-app mb-2 text-xs font-extrabold uppercase tracking-wider">
                Text size
              </legend>
              <div className="flex gap-2">
                {FONT_STEPS.map((step) => {
                  const active = prefs.fontScale === step.id;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onUpdatePrefs({ fontScale: step.id })}
                      className={`card-a11y min-h-11 min-w-14 px-3 text-sm font-bold ${
                        active ? "soft-accent" : "text-app"
                      }`}
                    >
                      {step.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <ToggleField
              label="High contrast"
              hint="Yellow on black, extra thick borders"
              checked={prefs.highContrast}
              onChange={(value) => onUpdatePrefs({ highContrast: value })}
            />
            <ToggleField
              label="Sensory calm"
              hint="Stops all animation and removes shadows"
              checked={prefs.sensoryCalm}
              onChange={(value) => onUpdatePrefs({ sensoryCalm: value })}
            />
            <div className="grid gap-2">
              <ToggleField
                label="Readable font"
                hint="Wider letter spacing for dyslexia"
                checked={prefs.dyslexiaFont}
                onChange={(value) => onUpdatePrefs({ dyslexiaFont: value })}
              />
              <ToggleField
                label="Voice reader"
                hint="Show a listen button on every listing"
                checked={prefs.voiceReader}
                onChange={(value) => onUpdatePrefs({ voiceReader: value })}
              />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

interface ToggleFieldProps {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function ToggleField({ label, hint, checked, onChange }: ToggleFieldProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="card-a11y flex min-h-11 w-full items-start gap-3 p-3 text-left"
    >
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
          checked ? "border-[var(--app-accent)] bg-[var(--app-accent)]" : "border-app"
        }`}
      >
        {checked ? <Check size={14} weight="bold" color="#ffffff" /> : null}
      </span>
      <span className="min-w-0">
        <span className="text-app block text-sm font-bold leading-tight">{label}</span>
        <span className="text-muted-app block text-xs leading-snug">{hint}</span>
      </span>
      {checked ? <X size={0} aria-hidden="true" /> : null}
    </button>
  );
}
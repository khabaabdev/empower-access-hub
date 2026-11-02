import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  CheckCircle,
  Circle,
  WarningCircle,
  SpeakerHigh,
  Sparkle,
  ArrowRight,
  SealCheck,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  BARRIER_KIND_LABEL,
  SAMPLE_DOCUMENTS,
  speakText,
  type BarrierWarning,
  type ResourceListing,
  type SampleDocument,
} from "../data/mockData";

const JARGON: Record<string, string> = {
  "pursuant to": "according to",
  furnish: "give",
  attest: "state",
  notwithstanding: "despite",
  remediate: "fix",
  delinquent: "overdue",
  disbursement: "payment",
  executed: "signed",
  "prior to": "before",
  "subject to": "needs",
  possess: "have",
  unassisted: "on your own",
  mandatory: "required",
  "categorical eligibility": "basic eligibility",
  "procedural termination": "automatic end",
  "third-party verification": "outside check",
  authorization: "permission",
  "extended periods": "long stretches",
  "open-plan": "shared room",
  shall: "must",
  applicant: "you",
  reside: "live",
};

function plainify(raw: string): string {
  let text = raw.replace(/\s+/g, " ").trim();
  for (const [hard, easy] of Object.entries(JARGON)) {
    text = text.replace(new RegExp(hard, "gi"), easy);
  }
  const sentences = text.match(/[^.!?]+[.!?]?/g) ?? [text];
  const short = sentences
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const words = s.split(" ");
      if (words.length > 16) {
        const mid = Math.ceil(words.length / 2);
        return `${words.slice(0, mid).join(" ")}. ${words.slice(mid).join(" ")}`;
      }
      return s;
    });
  return `In plain words: ${short.join(" ")}`;
}

function detectBarriers(raw: string): BarrierWarning[] {
  const lower = raw.toLowerCase();
  const out: BarrierWarning[] = [];
  if (/(loud|noise|noisy|crowd|busy|fast-paced|chime|announce)/.test(lower))
    out.push({ kind: "sensory", label: "Possible sensory load", note: "Look for a quiet time or a low-stimulus room before you go." });
  if (/(stair|stand|standing|lift \d+|pound|elevator|walk|open-plan)/.test(lower))
    out.push({ kind: "physical", label: "Possible physical demand", note: "Ask about a seated role, a ramp, or a step-free entrance." });
  if (/(degree|years of experience|background|screening|drug|resume|cv)/.test(lower))
    out.push({ kind: "cognitive", label: "Strict wording gate", note: "Apply anyway and ask for an accommodation in plain language." });
  if (/(fee|payment|purchase|pay|cost|deposit)/.test(lower))
    out.push({ kind: "cost", label: "Possible cost", note: "Ask whether the fee can be waived due to hardship." });
  return out;
}

function analyzeCustom(raw: string, listings: ResourceListing[]): SampleDocument {
  const lower = raw.toLowerCase();
  const keywords = ["food", "health", "medical", "work", "job", "transit", "bus", "legal", "energy", "utility", "quiet", "wheelchair", "asl"];
  const matched = listings
    .filter((l) => keywords.some((k) => `${l.title} ${l.category} ${l.description} ${l.plainSummary}`.toLowerCase().includes(k)))
    .slice(0, 3)
    .map((l) => ({ title: l.title, reason: l.plainSummary }));
  return {
    id: "custom",
    label: "Your document",
    raw,
    plain: plainify(raw),
    eligibility: [
      { text: "Bring any letter or bill this document mentions", met: "check" },
      { text: "You can ask for help filling it in", met: "yes" },
      { text: "No fee to simply ask a question", met: "yes" },
      { text: "You may re-apply if something is missing", met: "yes" },
    ],
    barriers: detectBarriers(raw),
    matches: matched.length ? matched : [{ title: "Neighborhood Resource Center", reason: "Quiet desk with staff who read forms with you" }],
  };
}

type Status = "idle" | "loading" | "result";

export default function DocumentScanner({ listings }: { listings: ResourceListing[] }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<SampleDocument | null>(null);

  const toneClass = useMemo(
    () => ({
      good: "soft-accent",
      warn: "warn-accent",
      bad: "warn-accent",
    }),
    [],
  );

  const run = (raw: string) => {
    if (!raw.trim()) {
      toast.error("Paste or pick a document first");
      return;
    }
    setStatus("loading");
    setResult(null);
    window.setTimeout(() => {
      const sample = SAMPLE_DOCUMENTS.find((s) => s.raw === raw);
      const out = sample ?? analyzeCustom(raw, listings);
      setResult(out);
      setStatus("result");
      toast.success("Document translated", { description: "Rewritten at a fifth-grade reading level." });
    }, 850);
  };

  return (
    <section className="border-b border-app surface">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <span className="soft-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider">
          <Brain size={14} weight="bold" aria-hidden="true" />
          Plain-language scanner
        </span>
        <h2 className="text-app mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Turn any form into plain English
        </h2>
        <p className="text-muted-app mt-1 max-w-2xl text-sm leading-relaxed">
          Paste a clinic form, welfare notice or job posting. Get a fifth-grade rewrite, an eligibility checklist,
          barrier warnings and matched local resources.
        </p>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {/* Input */}
          <div className="card-a11y p-4">
            <label htmlFor="doc-input" className="text-app block text-sm font-extrabold">
              Paste document text
            </label>
            <textarea
              id="doc-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={7}
              placeholder="Paste the fine print here..."
              className="text-app surface-muted mt-2 w-full rounded-lg border border-app p-3 text-sm leading-relaxed"
            />
            <p className="text-muted-app mt-2 text-xs font-bold uppercase tracking-wider">Or try a sample</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {SAMPLE_DOCUMENTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setText(s.raw);
                    run(s.raw);
                  }}
                  className="card-a11y text-app min-h-10 rounded-lg px-3 text-xs font-bold hover:surface-muted"
                >
                  {s.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => run(text)}
              disabled={status === "loading"}
              className="bg-accent-app mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold disabled:opacity-60"
            >
              <Sparkle size={18} weight="bold" aria-hidden="true" />
              {status === "loading" ? "Translating..." : "Translate to plain language"}
            </button>
          </div>

          {/* Output */}
          <div className="min-h-[18rem]">
            {status === "idle" ? (
              <div className="card-a11y flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
                <Brain size={30} weight="bold" aria-hidden="true" className="text-accent-app" />
                <p className="text-app text-sm font-extrabold">Your plain-language breakdown appears here</p>
                <p className="text-muted-app max-w-xs text-xs">Paste a document or pick a sample to begin.</p>
              </div>
            ) : null}

            {status === "loading" ? (
              <div className="card-a11y space-y-3 p-4" aria-busy="true" aria-live="polite">
                <div className="surface-muted h-5 w-2/3 animate-pulse rounded-md" />
                <div className="surface-muted h-4 w-full animate-pulse rounded-md" />
                <div className="surface-muted h-4 w-5/6 animate-pulse rounded-md" />
                <div className="surface-muted h-16 w-full animate-pulse rounded-md" />
                <p className="text-muted-app text-xs font-bold">Reading and simplifying your document...</p>
              </div>
            ) : null}

            {status === "result" && result ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-3"
              >
                <div className="card-a11y p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-app flex items-center gap-2 text-sm font-extrabold">
                      <SealCheck size={17} weight="bold" aria-hidden="true" className="text-accent-app" />
                      Plain-language summary
                    </p>
                    <button
                      type="button"
                      onClick={() => speakText(result.plain)}
                      className="text-app flex min-h-9 items-center gap-1.5 rounded-lg border border-app px-2.5 text-[11px] font-extrabold"
                    >
                      <SpeakerHigh size={14} weight="bold" aria-hidden="true" />
                      Listen
                    </button>
                  </div>
                  <p className="text-app mt-2 text-sm leading-relaxed">{result.plain}</p>
                </div>

                <div className="card-a11y p-4">
                  <p className="text-app text-sm font-extrabold">Eligibility checklist</p>
                  <ul className="mt-2 space-y-1.5">
                    {result.eligibility.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        {item.met === "yes" ? (
                          <CheckCircle size={17} weight="bold" aria-hidden="true" className="text-accent-app mt-0.5 shrink-0" />
                        ) : item.met === "no" ? (
                          <WarningCircle size={17} weight="bold" aria-hidden="true" className="text-app mt-0.5 shrink-0" />
                        ) : (
                          <Circle size={17} weight="bold" aria-hidden="true" className="text-muted-app mt-0.5 shrink-0" />
                        )}
                        <span className="text-muted-app text-sm leading-snug">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {result.barriers.length ? (
                  <div className="card-a11y p-4">
                    <p className="text-app text-sm font-extrabold">Barrier warnings</p>
                    <ul className="mt-2 space-y-2">
                      {result.barriers.map((b, i) => (
                        <li key={i} className={`rounded-lg p-3 ${toneClass.warn}`}>
                          <p className="text-app flex items-center gap-1.5 text-xs font-extrabold">
                            <WarningCircle size={15} weight="bold" aria-hidden="true" />
                            {BARRIER_KIND_LABEL[b.kind]} · {b.label}
                          </p>
                          <p className="text-muted-app mt-1 text-xs leading-snug">{b.note}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="card-a11y p-4">
                  <p className="text-app text-sm font-extrabold">Matched local resources</p>
                  <ul className="mt-2 space-y-2">
                    {result.matches.map((m, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ArrowRight size={16} weight="bold" aria-hidden="true" className="text-accent-app mt-0.5 shrink-0" />
                        <span>
                          <span className="text-app block text-sm font-bold leading-snug">{m.title}</span>
                          <span className="text-muted-app block text-xs leading-snug">{m.reason}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

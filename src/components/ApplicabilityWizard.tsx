"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { FRAMEWORK_BY_ID, type FrameworkId } from "@/data/frameworks";
import { CONTROLS } from "@/data/controls";
import { DEFAULT_PROFILE, LEVEL_META, assess, type CompanyProfile, type Industry, type Level, type Market, type Size } from "@/lib/applicability";

interface Props {
  mode: "public" | "app";
  initialProfile?: CompanyProfile | null;
  enabled?: FrameworkId[];
  onApply?: (profile: CompanyProfile, frameworks: FrameworkId[]) => Promise<void>;
}

const MARKETS: Market[] = ["India", "US", "EU", "UK", "California"];
const INDUSTRIES: [Industry, string][] = [
  ["saas", "SaaS / technology"],
  ["fintech", "Fintech / payments / lending"],
  ["bank_insurance", "Bank / insurance / investment"],
  ["healthcare", "Healthcare / health-tech"],
  ["ecommerce", "E-commerce / retail"],
  ["gov_contractor", "Government / defence contractor"],
  ["critical_infra", "Energy, telecom, transport, utilities"],
  ["manufacturing", "Manufacturing"],
  ["other", "Other"],
];
const QUESTIONS: [keyof CompanyProfile, string, string][] = [
  ["b2bEnterprise", "We sell to enterprise or regulated customers", "They run vendor security reviews and questionnaires"],
  ["personalData", "We process personal data", "Customers, users or employees"],
  ["sensitiveData", "We process sensitive personal data", "Health, biometric, financial, passwords, children"],
  ["phi", "We handle US protected health information (PHI)", "As a covered entity or business associate"],
  ["cardData", "We store, process or transmit payment card data", ""],
  ["aiProvider", "We build or sell AI systems / models", "Incl. LLM-based product features"],
  ["aiDeployer", "We use AI systems in our operations", "e.g. hiring, credit, support, analytics"],
  ["usListed", "We are SEC-listed (or preparing to IPO in the US)", ""],
  ["caThresholds", "We meet CCPA thresholds in California", "> $25M revenue, 100k+ CA consumers, or 50% revenue from selling PI"],
  ["nydfsLicensed", "We are licensed by the New York DFS", ""],
  ["cui", "We handle US Controlled Unclassified Information (CUI)", "DoD / federal contracts, DFARS 7012, CMMC"],
  ["federalCloud", "We provide cloud services to US federal agencies", "FedRAMP"],
  ["ukGovSupplier", "We supply UK central government", ""],
  ["indiaCloudOrVpn", "We are a data-centre, cloud, VPS or VPN provider in India", ""],
  ["continuityCritical", "Customers/regulators require certified business continuity", ""],
];

const LEVEL_STYLE: Record<Level, string> = {
  mandatory: "border-rose-200 bg-rose-50 text-rose-800",
  expected: "border-amber-200 bg-amber-50 text-amber-800",
  recommended: "border-slate-200 bg-slate-50 text-slate-600",
};

export default function ApplicabilityWizard({ mode, initialProfile, enabled = [], onApply }: Props) {
  const [p, setP] = useState<CompanyProfile>({ ...DEFAULT_PROFILE, ...(initialProfile ?? {}) });
  const results = useMemo(() => assess(p), [p]);
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  // Carry answers from the public assessment into the workspace (per-browser convenience only).
  useEffect(() => {
    if (mode !== "app" || initialProfile) return;
    try {
      const raw = localStorage.getItem("ucm_profile");
      if (raw) setP({ ...DEFAULT_PROFILE, ...JSON.parse(raw) });
    } catch {}
  }, [mode, initialProfile]);
  useEffect(() => {
    if (mode !== "public") return;
    try {
      localStorage.setItem("ucm_profile", JSON.stringify(p));
    } catch {}
  }, [mode, p]);

  const isPicked = (id: FrameworkId, level: Level) => picked[id] ?? (level !== "recommended" || enabled.includes(id));
  const chosen = results.filter((r) => isPicked(r.framework, r.level)).map((r) => r.framework);
  const reqCount = chosen.reduce((n, f) => n + FRAMEWORK_BY_ID[f].requirements.length, 0);
  const ctrlCount = CONTROLS.filter((c) => chosen.some((f) => c.map[f]?.length)).length;
  const set = <K extends keyof CompanyProfile>(k: K, v: CompanyProfile[K]) => {
    setSaved(false);
    setP({ ...p, [k]: v });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_1fr]">
      <div className="card space-y-5 p-5">
        <h2 className="font-semibold">Your company profile</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="hq">Headquarters</label>
            <select id="hq" className="input" value={p.hq} onChange={(e) => set("hq", e.target.value as CompanyProfile["hq"])}>
              {["India", "US", "EU", "UK", "Other"].map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="size">Size</label>
            <select id="size" className="input" value={p.size} onChange={(e) => set("size", e.target.value as Size)}>
              <option value="small">&lt; 50 staff</option>
              <option value="medium">50–249 staff</option>
              <option value="large">250+ staff</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="industry">Industry</label>
          <select id="industry" className="input" value={p.industry} onChange={(e) => set("industry", e.target.value as Industry)}>
            {INDUSTRIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <fieldset>
          <legend className="label">Where are your customers / users?</legend>
          <div className="flex flex-wrap gap-2">
            {MARKETS.map((m) => {
              const on = p.markets.includes(m);
              return (
                <button key={m} type="button" onClick={() => set("markets", on ? p.markets.filter((x) => x !== m) : [...p.markets, m])}
                  className={`rounded-full px-3 py-1 text-sm font-medium ring-1 ${on ? "bg-brand-600 text-white ring-brand-600" : "bg-white text-slate-600 ring-slate-300 hover:bg-slate-50"}`}>
                  {m}
                </button>
              );
            })}
          </div>
        </fieldset>
        <fieldset className="space-y-2">
          <legend className="label">What applies to you?</legend>
          {QUESTIONS.map(([k, q, hint]) => (
            <label key={k} className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50">
              <input type="checkbox" className="mt-1" checked={!!p[k]} onChange={(e) => set(k, e.target.checked as never)} />
              <span className="text-sm">
                {q}
                {hint && <span className="block text-xs text-slate-500">{hint}</span>}
              </span>
            </label>
          ))}
        </fieldset>
      </div>

      <div className="space-y-4">
        <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <div className="text-sm text-slate-500">Your compliance scope</div>
            <div className="mt-1 text-lg">
              <b>{chosen.length}</b> frameworks · <b>{reqCount}</b> requirements → <b className="text-brand-700">{ctrlCount} unified controls</b>
            </div>
            <div className="text-xs text-slate-500">Implement each control once; it is counted toward every selected framework.</div>
          </div>
          {mode === "public" ? (
            <Link href={`/signup?fw=${chosen.join(",")}`} className="btn-primary">Create a workspace with this scope →</Link>
          ) : (
            <button
              className="btn-primary"
              disabled={pending}
              onClick={() => start(async () => { await onApply?.(p, chosen); setSaved(true); })}
            >
              {pending ? "Saving…" : saved ? "✓ Applied to workspace" : `Apply scope to workspace`}
            </button>
          )}
        </div>

        {(["mandatory", "expected", "recommended"] as Level[]).map((lvl) => {
          const list = results.filter((r) => r.level === lvl);
          if (!list.length) return null;
          return (
            <div key={lvl}>
              <div className="mb-2 flex items-baseline gap-2">
                <h3 className="font-semibold">{LEVEL_META[lvl].label}</h3>
                <span className="text-xs text-slate-500">{LEVEL_META[lvl].help}</span>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {list.map((r) => {
                  const f = FRAMEWORK_BY_ID[r.framework];
                  return (
                    <label key={r.framework} className={`card flex cursor-pointer gap-3 p-4 ${isPicked(r.framework, r.level) ? "ring-2 ring-brand-200" : "opacity-70"}`}>
                      <input type="checkbox" className="mt-1" checked={isPicked(r.framework, r.level)} onChange={(e) => setPicked({ ...picked, [r.framework]: e.target.checked })} />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold" style={{ color: f.color }}>{f.name}</span>
                          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${LEVEL_STYLE[r.level]}`}>{LEVEL_META[r.level].label}</span>
                        </span>
                        <span className="mt-0.5 block text-[11px] text-slate-400">{f.kind} · {f.region} · {f.requirements.length} requirements</span>
                        <ul className="mt-1.5 list-inside list-disc text-xs text-slate-600">{r.reasons.map((x) => <li key={x}>{x}</li>)}</ul>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
        <p className="text-xs text-slate-500">
          Applicability is derived from each law&apos;s or standard&apos;s published scope triggers. It is a starting point for review with your legal counsel, not legal advice.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FRAMEWORKS, FRAMEWORK_BY_ID, type FrameworkId } from "@/data/frameworks";
import { DOMAINS } from "@/data/controls";
import { createCustomControlAction, suggestAction } from "@/app/app/actions";
import type { Suggestion } from "@/lib/mapper";

type Result = Awaited<ReturnType<typeof suggestAction>>;

export default function CustomControlBuilder({ enabled }: { enabled: FrameworkId[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState<string>("Access Control");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [manualFw, setManualFw] = useState<FrameworkId>(enabled[0] ?? "iso27001");
  const [manualCode, setManualCode] = useState("");
  const [extra, setExtra] = useState<Suggestion[]>([]);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const k = (s: { framework: string; code: string }) => `${s.framework}|${s.code}`;

  function suggest() {
    setError("");
    start(async () => {
      const r = await suggestAction(`${name} ${name} ${description}`);
      setResult(r);
      const pre: Record<string, boolean> = {};
      for (const list of Object.values(r.suggestions)) for (const s of list ?? []) if (s.score >= 0.3 && enabled.includes(s.framework)) pre[k(s)] = true;
      setPicked((p) => ({ ...pre, ...p }));
    });
  }

  function save() {
    const map: Record<string, string[]> = {};
    for (const [key, on] of Object.entries(picked)) {
      if (!on) continue;
      const [fw, code] = key.split("|");
      (map[fw] ??= []).push(code);
    }
    start(async () => {
      const r = await createCustomControlAction({ name, domain, description, map });
      if ("error" in r && r.error) setError(r.error);
      else if ("id" in r) router.push(`/app/controls/${r.id}`);
    });
  }

  const selectedCount = Object.values(picked).filter(Boolean).length;
  const ordered = [...FRAMEWORKS].sort((a, b) => Number(enabled.includes(b.id)) - Number(enabled.includes(a.id)));

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_1fr]">
      <div className="card space-y-4 p-5">
        <h2 className="font-semibold">1 · Describe your control</h2>
        <div>
          <label className="label" htmlFor="cname">Control name</label>
          <input id="cname" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Quarterly firewall rule review" />
        </div>
        <div>
          <label className="label" htmlFor="cdomain">Domain</label>
          <select id="cdomain" className="input" value={domain} onChange={(e) => setDomain(e.target.value)}>
            {DOMAINS.map((d) => <option key={d}>{d}</option>)}
            <option>Custom</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="cdesc">Control statement</label>
          <textarea id="cdesc" rows={6} className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Network engineering reviews all firewall and security group rules every quarter, removes unused rules and documents business justification…" />
        </div>
        <button className="btn-primary w-full" onClick={suggest} disabled={pending || description.trim().length < 15}>
          {pending && !result ? "Analyzing…" : "✨ Suggest framework mappings"}
        </button>
        {result && result.similar.length > 0 && (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            <b>Similar library controls already exist</b> — consider using one instead of creating a duplicate:
            <ul className="mt-1 space-y-0.5">
              {result.similar.map((s) => (
                <li key={s.id}><Link href={`/app/controls/${s.id}`} className="underline"><span className="font-mono">{s.id}</span> {s.name}</Link> <span className="text-xs opacity-70">({Math.round(s.score * 100)}% similar)</span></li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">2 · Review mappings</h2>
          <span className="text-sm text-slate-500">{selectedCount} selected</span>
        </div>
        {!result && <p className="mt-2 text-sm text-slate-500">Suggestions appear here. The engine scores your text against every requirement using TF-IDF similarity, enriched with the unified control library.</p>}
        {result && (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {ordered.map((f) => {
              const list = [...(result.suggestions[f.id] ?? []), ...extra.filter((e) => e.framework === f.id && !(result.suggestions[f.id] ?? []).some((s) => s.code === e.code))];
              return (
                <div key={f.id} className={`rounded-lg border border-slate-200 p-3 ${enabled.includes(f.id) ? "" : "opacity-60"}`}>
                  <div className="mb-2 text-sm font-semibold" style={{ color: f.color }}>{f.shortName}{!enabled.includes(f.id) && <span className="ml-1 text-xs font-normal text-slate-400">(not in scope)</span>}</div>
                  {list.length === 0 && <p className="text-xs text-slate-400">No strong matches.</p>}
                  <ul className="space-y-1">
                    {list.map((s) => (
                      <li key={s.code}>
                        <label className="flex cursor-pointer items-start gap-2 text-sm">
                          <input type="checkbox" className="mt-1" checked={!!picked[k(s)]} onChange={(e) => setPicked({ ...picked, [k(s)]: e.target.checked })} />
                          <span className="flex-1"><span className="font-mono text-xs font-semibold">{s.code}</span> <span className="text-slate-600">{s.title}</span></span>
                          {s.score > 0 && <span className="mt-0.5 rounded bg-slate-100 px-1 text-[11px] text-slate-500">{Math.round(s.score * 100)}</span>}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
        {result && (
          <div className="mt-4 flex flex-wrap items-end gap-2 rounded-lg bg-slate-50 p-3">
            <div>
              <label className="label" htmlFor="mfw">Add mapping manually</label>
              <select id="mfw" className="input" value={manualFw} onChange={(e) => { setManualFw(e.target.value as FrameworkId); setManualCode(""); }}>
                {FRAMEWORKS.map((f) => <option key={f.id} value={f.id}>{f.shortName}</option>)}
              </select>
            </div>
            <select aria-label="Requirement" className="input max-w-sm" value={manualCode} onChange={(e) => setManualCode(e.target.value)}>
              <option value="">Select requirement…</option>
              {FRAMEWORK_BY_ID[manualFw].requirements.map((r) => <option key={r.code} value={r.code}>{r.code} — {r.title}</option>)}
            </select>
            <button
              className="btn-secondary"
              disabled={!manualCode}
              onClick={() => {
                const req = FRAMEWORK_BY_ID[manualFw].requirements.find((r) => r.code === manualCode)!;
                const s = { framework: manualFw, code: req.code, title: req.title, score: 0 };
                setExtra([...extra, s]);
                setPicked({ ...picked, [k(s)]: true });
                setManualCode("");
              }}
            >
              Add
            </button>
          </div>
        )}
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        <div className="mt-5 flex justify-end">
          <button className="btn-primary" onClick={save} disabled={pending || !name.trim() || !description.trim()}>Save custom control</button>
        </div>
      </div>
    </div>
  );
}

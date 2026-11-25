"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { FRAMEWORKS, FRAMEWORK_BY_ID, type FrameworkId } from "@/data/frameworks";
import { REL_META, buildIndex, equivalentsForControls, isCorroborated, key, relationship, type ControlLike, type ControlStatus } from "@/lib/mapper";
import { MatchBadge, ProvenanceMark, RelBadge } from "@/components/ui";

type Selection = { kind: "req"; fw: FrameworkId; code: string } | { kind: "control"; id: string } | null;

interface Props {
  controls: ControlLike[];
  frameworks?: FrameworkId[];
  statuses?: Record<string, ControlStatus>;
  initial?: Selection;
  controlBase?: string; // e.g. "/app/controls/" — links control cards when set
  basePath: string; // page path used for shareable URLs
}

const STATUS_DOT: Record<ControlStatus, string> = {
  implemented: "bg-emerald-500",
  in_progress: "bg-amber-400",
  not_started: "bg-slate-300",
  not_applicable: "bg-slate-200",
};

export default function MapperExplorer({ controls, frameworks, statuses, initial = null, controlBase, basePath }: Props) {
  const initialFw = initial?.kind === "req" ? initial.fw : undefined;
  const fwList = useMemo(() => FRAMEWORKS.filter((f) => !frameworks || frameworks.includes(f.id) || f.id === initialFw), [frameworks, initialFw]);
  const [source, setSource] = useState<FrameworkId | "controls">(
    initial?.kind === "req" ? initial.fw : initial?.kind === "control" ? "controls" : (fwList[0]?.id ?? "iso27001"),
  );
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState<Selection>(initial);
  const [copied, setCopied] = useState(false);
  const [showWeak, setShowWeak] = useState(false);
  const index = useMemo(() => buildIndex(controls), [controls]);
  const byId = useMemo(() => Object.fromEntries(controls.map((c) => [c.id, c])), [controls]);

  useEffect(() => {
    if (!sel) return;
    const qs = sel.kind === "req" ? `?fw=${sel.fw}&code=${encodeURIComponent(sel.code)}` : `?control=${sel.id}`;
    window.history.replaceState(null, "", `${basePath}${qs}`);
  }, [sel, basePath]);

  const q = query.trim().toLowerCase();
  const items = useMemo(() => {
    if (source === "controls") {
      return controls
        .filter((c) => !q || `${c.id} ${c.name} ${c.domain} ${c.description}`.toLowerCase().includes(q))
        .map((c) => ({ group: c.domain, k: c.id, code: c.id, title: c.name, select: { kind: "control" as const, id: c.id } }));
    }
    const f = FRAMEWORK_BY_ID[source];
    return f.requirements
      .filter((r) => !q || `${r.code} ${r.title} ${r.group}`.toLowerCase().includes(q))
      .map((r) => ({ group: r.group, k: r.code, code: r.code, title: r.title, select: { kind: "req" as const, fw: f.id, code: r.code } }));
  }, [source, q, controls]);

  const linked: ControlLike[] = useMemo(() => {
    if (!sel) return [];
    if (sel.kind === "control") return byId[sel.id] ? [byId[sel.id]] : [];
    return index.get(key(sel.fw, sel.code)) ?? [];
  }, [sel, index, byId]);

  const allEquivalents = useMemo(
    () => (sel ? equivalentsForControls(linked, sel.kind === "req" ? sel.fw : undefined, sel.kind === "req" ? sel.code : undefined) : {}),
    [sel, linked],
  );
  const hiddenWeak = Object.values(allEquivalents).flat().filter((e) => e!.match === "weak").length;
  const equivalents = useMemo(() => {
    if (showWeak) return allEquivalents;
    return Object.fromEntries(Object.entries(allEquivalents).map(([f, list]) => [f, list!.filter((e) => e.match !== "weak")]));
  }, [allEquivalents, showWeak]) as typeof allEquivalents;

  const shownFw = fwList.filter((f) => equivalents[f.id]?.length);
  const totalEquivalents = shownFw.reduce((n, f) => n + (equivalents[f.id]?.length ?? 0), 0);

  function exportCsv() {
    const rows = [["Framework", "Requirement", "Title", "Match strength", "Via unified controls (STRM relationship)", "SCF-corroborated"]];
    for (const f of shownFw)
      for (const e of equivalents[f.id] ?? [])
        rows.push([
          f.shortName, e.code, e.title, e.match ?? "",
          e.links.map((l) => `${l.control} (${REL_META[l.rel].label})`).join("; "),
          e.links.some((l) => l.corroborated) ? "yes" : "no",
        ]);
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `mapping-${sel?.kind === "req" ? `${sel.fw}-${sel.code}` : sel?.kind === "control" ? sel.id : "x"}.csv`;
    a.click();
  }

  let lastGroup = "";
  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      {/* Left: picker */}
      <div className="card flex max-h-[78vh] flex-col overflow-hidden">
        <div className="space-y-2 border-b border-slate-200 p-3">
          <label className="label" htmlFor="src">
            Start from
          </label>
          <select id="src" className="input" value={source} onChange={(e) => setSource(e.target.value as FrameworkId | "controls")}>
            {fwList.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
            <option value="controls">Unified control library ({controls.length})</option>
          </select>
          <input
            className="input"
            placeholder={source === "controls" ? "Search controls, e.g. MFA, backup…" : "Search code or title, e.g. A.5.15, access…"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <ul className="flex-1 overflow-y-auto p-1">
          {items.length === 0 && <li className="p-4 text-center text-sm text-slate-500">No matches</li>}
          {items.map((it) => {
            const header = it.group !== lastGroup ? (lastGroup = it.group) : null;
            const active =
              sel &&
              ((sel.kind === "req" && it.select.kind === "req" && sel.fw === it.select.fw && sel.code === it.code) ||
                (sel.kind === "control" && it.select.kind === "control" && sel.id === it.code));
            const count = it.select.kind === "req" ? (index.get(key(it.select.fw, it.code))?.length ?? 0) : null;
            return (
              <li key={it.k}>
                {header && <div className="px-3 pt-3 pb-1 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">{header}</div>}
                <button
                  onClick={() => setSel(it.select)}
                  className={`flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                    active ? "bg-brand-50 ring-1 ring-brand-200" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="mt-0.5 min-w-[4.5rem] font-mono text-xs font-semibold text-slate-700">{it.code}</span>
                  <span className="flex-1 text-slate-700">{it.title}</span>
                  {count !== null && (
                    <span className="mt-0.5 rounded bg-slate-100 px-1.5 text-[11px] text-slate-500" title="Unified controls">
                      {count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Right: mapping result */}
      <div className="space-y-4">
        {!sel && (
          <div className="card flex flex-col items-center justify-center p-12 text-center">
            <div className="text-4xl">🧭</div>
            <h2 className="mt-3 text-lg font-semibold">Pick a requirement or control</h2>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Select any requirement — say ISO 27001 A.8.5 Secure authentication — and see every equivalent requirement across{" "}
              {fwList.length} frameworks, linked through the unified control that satisfies them all.
            </p>
          </div>
        )}

        {sel && (
          <div className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                {sel.kind === "req" ? (
                  <>
                    <div className="text-xs font-semibold tracking-wide uppercase" style={{ color: FRAMEWORK_BY_ID[sel.fw].color }}>
                      {FRAMEWORK_BY_ID[sel.fw].name}
                    </div>
                    <h2 className="mt-1 text-xl font-bold">
                      <span className="font-mono">{sel.code}</span> ·{" "}
                      {FRAMEWORK_BY_ID[sel.fw].requirements.find((r) => r.code === sel.code)?.title}
                    </h2>
                  </>
                ) : (
                  <>
                    <div className="text-xs font-semibold tracking-wide text-brand-700 uppercase">Unified control · {byId[sel.id]?.domain}</div>
                    <h2 className="mt-1 text-xl font-bold">
                      <span className="font-mono">{sel.id}</span> · {byId[sel.id]?.name}
                    </h2>
                  </>
                )}
                <p className="mt-2 text-sm text-slate-500" data-summary>
                  Implement <b className="text-slate-800">{linked.length}</b> unified control{linked.length === 1 ? "" : "s"} once → satisfies{" "}
                  <b className="text-slate-800">{totalEquivalents}</b> requirement{totalEquivalents === 1 ? "" : "s"} across{" "}
                  <b className="text-slate-800">{shownFw.length}</b> framework{shownFw.length === 1 ? "" : "s"}.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {copied ? "Copied!" : "Copy link"}
                </button>
                <button className="btn-secondary" onClick={exportCsv} disabled={!totalEquivalents}>
                  Export CSV
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {linked.map((c) => {
                const st = statuses?.[c.id] ?? "not_started";
                const body = (
                  <div className="h-full rounded-lg border border-brand-100 bg-brand-50/50 p-3 transition hover:border-brand-200">
                    <div className="flex items-center gap-2">
                      {statuses && <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[st]}`} title={st} />}
                      <span className="font-mono text-xs font-semibold whitespace-nowrap text-brand-700">{c.id}</span>
                      {c.custom && <span className="rounded bg-violet-100 px-1.5 text-[10px] font-semibold text-violet-700">CUSTOM</span>}
                      <span className="text-sm font-semibold">{c.name}</span>
                    </div>
                    {sel.kind === "req" && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <RelBadge rel={relationship(c, sel.fw, sel.code)} />
                        {!c.custom && <ProvenanceMark corroborated={isCorroborated(c.id, sel.fw, sel.code)} />}
                      </div>
                    )}
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">{c.description}</p>
                  </div>
                );
                return controlBase ? (
                  <Link key={c.id} href={`${controlBase}${c.id}`}>
                    {body}
                  </Link>
                ) : (
                  <div key={c.id}>{body}</div>
                );
              })}
              {linked.length === 0 && <p className="text-sm text-slate-500">No unified control mapped yet.</p>}
            </div>
          </div>
        )}

        {sel && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-600">Relationship (NIST IR 8477):</span>
              {(["equal", "subset_of", "superset_of", "intersects_with"] as const).map((r) => <RelBadge key={r} rel={r} />)}
              <Link href="/methodology" className="font-semibold text-brand-700 hover:underline">Methodology →</Link>
            </div>
            {sel.kind === "req" && hiddenWeak > 0 && (
              <label className="flex items-center gap-1.5">
                <input type="checkbox" checked={showWeak} onChange={(e) => setShowWeak(e.target.checked)} />
                Show {hiddenWeak} supporting-only link{hiddenWeak === 1 ? "" : "s"}
              </label>
            )}
          </div>
        )}

        {sel && shownFw.length > 0 && (
          <div className="grid gap-4 xl:grid-cols-2">
            {shownFw.map((f) => (
              <div key={f.id} className="card overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5" style={{ background: `${f.color}0d` }}>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: f.color }} />
                    <span className="text-sm font-semibold">{f.name}</span>
                  </div>
                  <span className="text-xs text-slate-500">{equivalents[f.id]!.length} mapped</span>
                </div>
                <ul className="divide-y divide-slate-100">
                  {equivalents[f.id]!.map((e) => (
                    <li key={e.code}>
                      <button
                        className="flex w-full items-start gap-3 px-4 py-2 text-left text-sm hover:bg-slate-50"
                        onClick={() => {
                          setSource(f.id);
                          setQuery("");
                          setSel({ kind: "req", fw: f.id, code: e.code });
                        }}
                        title="Pivot to this requirement"
                      >
                        <span className="min-w-[5.5rem] font-mono text-xs font-semibold" style={{ color: f.color }}>
                          {e.code}
                        </span>
                        <span className="flex-1 text-slate-700">
                          {e.title}
                          <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                            {e.links.map((l) => (
                              <span key={l.control} className="inline-flex items-center gap-1">
                                {linked.length > 1 && <span>{l.control}</span>}
                                <RelBadge rel={l.rel} compact />
                              </span>
                            ))}
                            <ProvenanceMark corroborated={e.links.some((l) => l.corroborated)} />
                          </span>
                        </span>
                        {e.match && <MatchBadge match={e.match} />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

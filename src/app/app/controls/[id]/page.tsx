import Link from "next/link";
import { notFound } from "next/navigation";
import { loadWorkspace } from "@/lib/workspace";
import { evidenceFor, STATUSES } from "@/lib/org";
import { CONTROL_BY_ID } from "@/data/controls";
import { FRAMEWORKS, type FrameworkId } from "@/data/frameworks";
import { findRequirement, type ControlStatus } from "@/lib/mapper";
import { PageHeader, StatusBadge, fmtDate, statusLabel } from "@/components/ui";
import { addEvidenceAction, deleteCustomControlAction, deleteEvidenceAction, updateControlAction } from "../../actions";

export default async function ControlDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, frameworks, controls, states, status } = await loadWorkspace();
  const c = controls.find((x) => x.id === id);
  if (!c) notFound();
  const lib = CONTROL_BY_ID[c.id];
  const st = states[c.id];
  const evidence = evidenceFor(session.orgId, c.id);
  const mapped = FRAMEWORKS.filter((f) => c.map[f.id]?.length);
  const inScope = mapped.filter((f) => frameworks.includes(f.id));
  const reqCount = inScope.reduce((n, f) => n + (c.map[f.id]?.length ?? 0), 0);

  return (
    <div>
      <div className="mb-2 text-sm"><Link href="/app/controls" className="text-slate-500 hover:text-slate-800">← Controls</Link></div>
      <PageHeader
        title={`${c.id} · ${c.name}`}
        subtitle={<>{c.domain}{lib && <> · {lib.frequency} · {lib.automatable ? "Evidence can be automated" : "Manual evidence"}</>}</>}
        actions={<><StatusBadge status={status[c.id] ?? "not_started"} /><Link href={`/app/mapper?control=${c.id}`} className="btn-secondary">Open in mapper</Link></>}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="card p-5">
            <h2 className="font-semibold">Control statement</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{c.description}</p>
            {lib && (
              <>
                <h3 className="mt-4 text-sm font-semibold">Suggested evidence</h3>
                <ul className="mt-1 list-inside list-disc text-sm text-slate-600">{lib.evidence.map((e) => <li key={e}>{e}</li>)}</ul>
              </>
            )}
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Framework mappings</h2>
              <span className="text-xs text-slate-500">Satisfies {reqCount} in-scope requirement{reqCount === 1 ? "" : "s"}</span>
            </div>
            <div className="mt-3 space-y-4">
              {mapped.map((f) => (
                <div key={f.id} className={frameworks.includes(f.id) ? "" : "opacity-50"}>
                  <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: f.color }}>
                    <span className="h-2 w-2 rounded-full" style={{ background: f.color }} />{f.name}
                    {!frameworks.includes(f.id) && <span className="text-xs font-normal text-slate-400">(not in scope)</span>}
                  </div>
                  <ul className="mt-1 ml-4 space-y-0.5 text-sm">
                    {c.map[f.id]!.map((code) => (
                      <li key={code}>
                        <Link href={`/app/mapper?fw=${f.id}&code=${encodeURIComponent(code)}`} className="hover:underline">
                          <span className="font-mono text-xs font-semibold">{code}</span> <span className="text-slate-600">{findRequirement(f.id as FrameworkId, code)?.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold">Evidence</h2>
            <p className="text-xs text-slate-500">Evidence attached here is reused for every mapped requirement.</p>
            <ul className="mt-3 divide-y divide-slate-100">
              {evidence.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <div>
                    {e.url ? <a href={e.url} target="_blank" rel="noreferrer noopener" className="font-medium text-brand-700 hover:underline">{e.title}</a> : <span className="font-medium">{e.title}</span>}
                    <div className="text-xs text-slate-500">Added by {e.added_by} · {fmtDate(e.created_at)}</div>
                  </div>
                  <form action={deleteEvidenceAction}>
                    <input type="hidden" name="id" value={e.id} /><input type="hidden" name="controlId" value={c.id} />
                    <button className="text-xs text-slate-400 hover:text-rose-600">Remove</button>
                  </form>
                </li>
              ))}
              {evidence.length === 0 && <li className="py-3 text-sm text-slate-500">No evidence yet.</li>}
            </ul>
            <form action={addEvidenceAction} className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input type="hidden" name="controlId" value={c.id} />
              <input name="title" required placeholder="Evidence title, e.g. Q3 access review" className="input" />
              <input name="url" type="url" placeholder="https:// link (Drive, Jira, Confluence…)" className="input" />
              <button className="btn-secondary">Add</button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <form action={updateControlAction} className="card space-y-4 p-5">
            <h2 className="font-semibold">Implementation</h2>
            <input type="hidden" name="controlId" value={c.id} />
            <div>
              <label className="label" htmlFor="status">Status</label>
              <select id="status" name="status" defaultValue={st?.status ?? "not_started"} className="input">
                {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s as ControlStatus)}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="owner">Owner</label>
              <input id="owner" name="owner" defaultValue={st?.owner ?? ""} placeholder="e.g. Priya (IT)" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="notes">Implementation notes</label>
              <textarea id="notes" name="notes" rows={5} defaultValue={st?.notes ?? ""} placeholder="How is this control implemented in your environment?" className="input" />
            </div>
            <button className="btn-primary w-full">Save</button>
            {st && <p className="text-xs text-slate-500">Last updated {fmtDate(st.updated_at)} by {st.updated_by}</p>}
          </form>
          {c.custom && (
            <form action={deleteCustomControlAction} className="card p-5">
              <input type="hidden" name="id" value={c.id} />
              <h2 className="font-semibold">Custom control</h2>
              <p className="mt-1 text-xs text-slate-500">Deleting removes its mappings and status from this workspace.</p>
              <button className="btn mt-3 w-full border border-rose-200 text-rose-700 hover:bg-rose-50">Delete control</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

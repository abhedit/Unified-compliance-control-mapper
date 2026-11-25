import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace";
import { FRAMEWORK_BY_ID, type FrameworkId } from "@/data/frameworks";
import { FrameworkBadge, PageHeader, StatusBadge } from "@/components/ui";
import { STATUSES } from "@/lib/org";
import { statusLabel } from "@/components/ui";
import type { ControlStatus } from "@/lib/mapper";

export const metadata = { title: "Controls" };

export default async function ControlsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const { frameworks, controls, states, status, inScope } = await loadWorkspace();
  const fwFilter = sp.fw && frameworks.includes(sp.fw as FrameworkId) ? [sp.fw as FrameworkId] : frameworks;
  const q = (sp.q ?? "").toLowerCase();
  const domains = [...new Set(controls.map((c) => c.domain))];
  const rows = controls
    .filter((c) => (sp.scope === "all" ? true : inScope(c, fwFilter)))
    .filter((c) => !sp.domain || c.domain === sp.domain)
    .filter((c) => !sp.status || (status[c.id] ?? "not_started") === sp.status)
    .filter((c) => !q || `${c.id} ${c.name} ${c.description}`.toLowerCase().includes(q));

  return (
    <div>
      <PageHeader
        title="Unified controls"
        subtitle="Each control is implemented and evidenced once, then counted toward every mapped framework requirement."
        actions={<><a href="/app/export?type=controls" className="btn-secondary">Export CSV</a><Link href="/app/custom" className="btn-primary">+ Custom control</Link></>}
      />
      <form className="card mb-4 grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-5">
        <input name="q" defaultValue={sp.q} placeholder="Search controls…" className="input lg:col-span-2" />
        <select name="fw" defaultValue={sp.fw ?? ""} className="input">
          <option value="">All my frameworks</option>
          {frameworks.map((f) => <option key={f} value={f}>{FRAMEWORK_BY_ID[f].shortName}</option>)}
        </select>
        <select name="domain" defaultValue={sp.domain ?? ""} className="input">
          <option value="">All domains</option>
          {domains.map((d) => <option key={d}>{d}</option>)}
        </select>
        <div className="flex gap-2">
          <select name="status" defaultValue={sp.status ?? ""} className="input">
            <option value="">Any status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s as ControlStatus)}</option>)}
          </select>
          <button className="btn-secondary">Filter</button>
        </div>
      </form>
      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead><tr><th>Control</th><th>Domain</th><th>Maps to</th><th>Owner</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="min-w-[260px]">
                  <Link href={`/app/controls/${c.id}`} className="group">
                    <span className="font-mono text-xs font-semibold text-brand-700">{c.id}</span>
                    {c.custom && <span className="ml-1 rounded bg-violet-100 px-1 text-[10px] font-semibold text-violet-700">CUSTOM</span>}
                    <div className="font-medium group-hover:text-brand-700">{c.name}</div>
                  </Link>
                </td>
                <td className="text-slate-500 whitespace-nowrap">{c.domain}</td>
                <td>
                  <div className="flex max-w-xl flex-wrap gap-1">
                    {(fwFilter.length ? fwFilter : frameworks).flatMap((f) => (c.map[f] ?? []).map((code) => <FrameworkBadge key={f + code} id={f} code={code} />))}
                  </div>
                </td>
                <td className="text-slate-600 whitespace-nowrap">{states[c.id]?.owner ?? <span className="text-slate-300">Unassigned</span>}</td>
                <td><StatusBadge status={status[c.id] ?? "not_started"} /></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-slate-500">No controls match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Showing {rows.length} controls in scope of your frameworks. <Link href="/app/controls?scope=all" className="font-semibold text-brand-600">Show full library</Link>
      </p>
    </div>
  );
}

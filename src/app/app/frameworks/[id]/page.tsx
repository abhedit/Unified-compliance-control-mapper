import Link from "next/link";
import { notFound } from "next/navigation";
import { loadWorkspace } from "@/lib/workspace";
import { REL_META, coverage, relationship, type ReqStatus } from "@/lib/mapper";
import { FRAMEWORK_BY_ID, type FrameworkId } from "@/data/frameworks";
import { PageHeader, Progress, RelBadge, ReqStatusBadge, Stat, StatusBadge } from "@/components/ui";

export default async function FrameworkDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ show?: string }> }) {
  const { id } = await params;
  const { show } = await searchParams;
  const f = FRAMEWORK_BY_ID[id as FrameworkId];
  if (!f) notFound();
  const { frameworks, controls, status } = await loadWorkspace();
  const cov = coverage(controls, f.id, status);
  const filter = (["met", "partial", "gap"] as ReqStatus[]).includes(show as ReqStatus) ? (show as ReqStatus) : null;
  const rows = cov.rows.filter((r) => !filter || r.status === filter);
  const groups = [...new Set(rows.map((r) => r.requirement.group))];

  return (
    <div>
      <div className="mb-2 text-sm"><Link href="/app/frameworks" className="text-slate-500 hover:text-slate-800">← Frameworks</Link></div>
      <PageHeader
        title={f.name}
        subtitle={<>{f.description} {!frameworks.includes(f.id) && <b className="text-amber-700">Not in scope — enable it in Settings to track it.</b>}</>}
        actions={<><a className="btn-secondary" href={`/app/export?type=soa&fw=${f.id}`}>Export SoA / gap report (CSV)</a></>}
      />
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Readiness" value={<span style={{ color: f.color }}>{cov.percent}%</span>} hint={<Progress value={cov.percent} color={f.color} />} />
        <Stat label="Met" value={cov.met} />
        <Stat label="Partial" value={cov.partial} />
        <Stat label="Gaps" value={cov.gap} />
      </div>
      <div className="mt-6 mb-3 flex flex-wrap gap-2 text-sm">
        {[["", "All"], ["gap", "Gaps only"], ["partial", "Partial"], ["met", "Met"]].map(([v, l]) => (
          <Link key={v} href={`/app/frameworks/${f.id}${v ? `?show=${v}` : ""}`} className={`rounded-full px-3 py-1 font-medium ${(filter ?? "") === v ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}>{l}</Link>
        ))}
      </div>
      <div className="space-y-6">
        {groups.map((g) => (
          <div key={g} className="card overflow-x-auto">
            <div className="border-b border-slate-100 px-4 py-2.5 text-sm font-semibold">{g}</div>
            <table className="table-base">
              <thead><tr><th className="w-28">Ref</th><th>Requirement</th><th>Unified controls (STRM relationship)</th><th className="w-24">Status</th></tr></thead>
              <tbody>
                {rows.filter((r) => r.requirement.group === g).map((r) => (
                  <tr key={r.requirement.code}>
                    <td className="font-mono text-xs font-semibold" style={{ color: f.color }}>
                      <Link href={`/app/mapper?fw=${f.id}&code=${encodeURIComponent(r.requirement.code)}`} className="hover:underline">{r.requirement.code}</Link>
                    </td>
                    <td>
                      {r.requirement.title}
                      <div className="mt-0.5 text-[11px] text-slate-400">
                        {r.controls.some((c) => REL_META[relationship(c, f.id, r.requirement.code)].full) ? "Covered by a single control" : "Composite coverage — all required controls needed"}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        {r.controls.map((c) => (
                          <Link key={c.id} href={`/app/controls/${c.id}`} className="flex items-center gap-2 text-xs hover:underline">
                            <RelBadge rel={relationship(c, f.id, r.requirement.code)} compact />
                            <StatusBadge status={status[c.id] ?? "not_started"} />
                            <span className="font-mono font-semibold text-brand-700">{c.id}</span> <span className="text-slate-600">{c.name}</span>
                          </Link>
                        ))}
                      </div>
                    </td>
                    <td><ReqStatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

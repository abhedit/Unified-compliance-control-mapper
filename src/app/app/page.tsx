import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace";
import { getProfile, recentActivity } from "@/lib/org";
import { coverage, overlap } from "@/lib/mapper";
import { FRAMEWORK_BY_ID } from "@/data/frameworks";
import { Empty, PageHeader, Progress, Stat, StatusBadge, fmtDate } from "@/components/ui";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const { session, frameworks, controls, status, inScope } = await loadWorkspace();
  const scoped = controls.filter((c) => inScope(c));
  const applicable = scoped.filter((c) => status[c.id] !== "not_applicable");
  const implemented = applicable.filter((c) => status[c.id] === "implemented").length;
  const inProgress = applicable.filter((c) => status[c.id] === "in_progress").length;
  const covs = frameworks.map((f) => ({ f: FRAMEWORK_BY_ID[f], cov: coverage(controls, f, status) }));
  const totalReqs = covs.reduce((n, c) => n + c.cov.total, 0);

  // Highest-leverage next controls: not implemented, touching the most in-scope requirements.
  const leverage = applicable
    .filter((c) => status[c.id] !== "implemented")
    .map((c) => ({ c, n: frameworks.reduce((k, f) => k + (c.map[f]?.length ?? 0), 0), fws: frameworks.filter((f) => c.map[f]?.length) }))
    .sort((a, b) => b.n - a.n || b.fws.length - a.fws.length)
    .slice(0, 6);
  const activity = recentActivity(session.orgId, 8);

  return (
    <div>
      <PageHeader
        title={`Welcome, ${session.name.split(" ")[0]}`}
        subtitle={`${session.orgName} is tracking ${frameworks.length} framework${frameworks.length === 1 ? "" : "s"} through ${scoped.length} unified controls.`}
        actions={<Link href="/app/mapper" className="btn-primary">Open control mapper</Link>}
      />

      {!getProfile(session.orgId) && (
        <Link href="/app/obligations" className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm hover:bg-brand-100">
          <span><b className="text-brand-800">Which laws and standards apply to {session.orgName}?</b> <span className="text-brand-700">Answer a short profile to identify mandatory, customer-expected and recommended frameworks.</span></span>
          <span className="font-semibold whitespace-nowrap text-brand-700">Run assessment →</span>
        </Link>
      )}
      {frameworks.length === 0 ? (
        <Empty>
          No frameworks enabled yet. <Link className="font-semibold text-brand-700" href="/app/settings">Choose frameworks →</Link>
        </Empty>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Controls implemented" value={`${implemented}/${applicable.length}`} hint={`${inProgress} in progress`} />
            <Stat label="Requirements in scope" value={totalReqs} hint={`across ${frameworks.length} frameworks`} />
            <Stat label="Work saved by mapping" value={`${totalReqs ? Math.round((1 - applicable.length / totalReqs) * 100) : 0}%`} hint={`${applicable.length} controls instead of ${totalReqs} requirements`} />
            <Stat label="Overall readiness" value={`${applicable.length ? Math.round((implemented / applicable.length) * 100) : 0}%`} hint="implemented controls" />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <div className="card p-5 xl:col-span-2">
              <h2 className="font-semibold">Framework readiness</h2>
              <p className="text-xs text-slate-500">A requirement is met when every unified control mapped to it is implemented.</p>
              <div className="mt-4 space-y-4">
                {covs.map(({ f, cov }) => (
                  <Link key={f.id} href={`/app/frameworks/${f.id}`} className="block rounded-lg p-2 hover:bg-slate-50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{f.name}</span>
                      <span className="font-bold" style={{ color: f.color }}>{cov.percent}%</span>
                    </div>
                    <Progress value={cov.percent} color={f.color} className="mt-1.5" />
                    <div className="mt-1 flex gap-4 text-xs text-slate-500">
                      <span>✓ {cov.met} met</span><span>◐ {cov.partial} partial</span><span>✕ {cov.gap} gaps</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-semibold">Highest-leverage next steps</h2>
              <p className="text-xs text-slate-500">Open controls that close the most requirements.</p>
              <ul className="mt-3 divide-y divide-slate-100">
                {leverage.map(({ c, n, fws }) => (
                  <li key={c.id}>
                    <Link href={`/app/controls/${c.id}`} className="flex items-start gap-3 py-2.5 hover:opacity-80">
                      <span className="mt-0.5 rounded-md bg-brand-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-brand-700">{c.id}</span>
                      <span className="flex-1 text-sm">
                        <span className="font-medium">{c.name}</span>
                        <span className="block text-xs text-slate-500">{n} requirements · {fws.length} frameworks</span>
                      </span>
                      <StatusBadge status={status[c.id] ?? "not_started"} />
                    </Link>
                  </li>
                ))}
                {leverage.length === 0 && <li className="py-4 text-sm text-slate-500">All in-scope controls are implemented 🎉</li>}
              </ul>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            {frameworks.length > 1 && (
              <div className="card overflow-x-auto p-5 xl:col-span-2">
                <h2 className="font-semibold">Framework overlap</h2>
                <p className="text-xs text-slate-500">Share of the column framework&apos;s requirements touched by controls that also serve the row framework.</p>
                <table className="mt-3 text-sm">
                  <thead>
                    <tr>
                      <th className="p-2" />
                      {frameworks.map((b) => <th key={b} className="p-2 text-xs font-semibold whitespace-nowrap text-slate-500">{FRAMEWORK_BY_ID[b].shortName}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {frameworks.map((a) => (
                      <tr key={a}>
                        <th className="p-2 text-left text-xs font-semibold whitespace-nowrap text-slate-500">{FRAMEWORK_BY_ID[a].shortName}</th>
                        {frameworks.map((b) => {
                          if (a === b) return <td key={b} className="p-1"><div className="rounded bg-slate-100 p-2 text-center text-xs text-slate-400">—</div></td>;
                          const v = Math.round(overlap(controls, b, a) * 100);
                          return (
                            <td key={b} className="p-1">
                              <Link href={`/app/crosswalk?a=${a}&b=${b}`} className="block rounded p-2 text-center text-xs font-semibold" style={{ background: `rgba(4,127,255,${0.08 + v / 130})`, color: v > 55 ? "#fff" : "#0f172a" }}>
                                {v}%
                              </Link>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="card p-5">
              <h2 className="font-semibold">Recent activity</h2>
              <ul className="mt-3 space-y-2.5 text-sm">
                {activity.map((a, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span><b className="font-medium">{a.user_name}</b> <span className="text-slate-500">{a.action.replace(/[._]/g, " ")}</span> <span className="text-slate-700">{a.detail}</span></span>
                    <span className="shrink-0 text-xs text-slate-400">{fmtDate(a.created_at)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

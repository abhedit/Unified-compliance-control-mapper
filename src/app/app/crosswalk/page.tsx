import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace";
import { crosswalk, overlap } from "@/lib/mapper";
import { FRAMEWORKS, FRAMEWORK_BY_ID, FRAMEWORK_IDS, type FrameworkId } from "@/data/frameworks";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Crosswalk" };

export default async function CrosswalkPage({ searchParams }: { searchParams: Promise<{ a?: string; b?: string; only?: string }> }) {
  const sp = await searchParams;
  const { controls, frameworks } = await loadWorkspace();
  const valid = (x?: string) => (x && FRAMEWORK_IDS.includes(x as FrameworkId) ? (x as FrameworkId) : null);
  const a = valid(sp.a) ?? frameworks[0] ?? "iso27001";
  const b = valid(sp.b) ?? frameworks.find((f) => f !== a) ?? (a === "soc2" ? "iso27001" : "soc2");
  const fa = FRAMEWORK_BY_ID[a], fb = FRAMEWORK_BY_ID[b];
  const rows = crosswalk(controls, a, b).filter((r) => sp.only !== "unmapped" || r.targets.length === 0);
  const ab = Math.round(overlap(controls, a, b) * 100);
  const ba = Math.round(overlap(controls, b, a) * 100);

  return (
    <div>
      <PageHeader title="Framework crosswalk" subtitle="See exactly how two frameworks line up through shared unified controls — plan your next certification or answer an auditor's mapping request." actions={<a className="btn-secondary" href={`/app/export?type=crosswalk&a=${a}&b=${b}`}>Export CSV</a>} />
      <form className="card mb-4 flex flex-wrap items-end gap-3 p-3">
        <div><label className="label" htmlFor="a">Source framework</label>
          <select id="a" name="a" defaultValue={a} className="input">{FRAMEWORKS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
        <div><label className="label" htmlFor="b">Target framework</label>
          <select id="b" name="b" defaultValue={b} className="input">{FRAMEWORKS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
        <label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" name="only" value="unmapped" defaultChecked={sp.only === "unmapped"} /> Only rows without a match</label>
        <button className="btn-primary">Compare</button>
        <Link href={`/app/crosswalk?a=${b}&b=${a}`} className="btn-ghost">⇄ Swap</Link>
      </form>
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div className="card p-4 text-sm"><b style={{ color: fa.color }}>{ab}%</b> of {fa.shortName} requirements have a {fb.shortName} counterpart</div>
        <div className="card p-4 text-sm"><b style={{ color: fb.color }}>{ba}%</b> of {fb.shortName} requirements have a {fa.shortName} counterpart</div>
      </div>
      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead><tr><th className="w-28" style={{ color: fa.color }}>{fa.shortName}</th><th>Requirement</th><th style={{ color: fb.color }}>{fb.shortName} equivalents</th><th>Via</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.requirement.code}>
                <td className="font-mono text-xs font-semibold" style={{ color: fa.color }}>{r.requirement.code}</td>
                <td className="min-w-[200px]">{r.requirement.title}</td>
                <td className="min-w-[260px]">
                  {r.targets.length === 0 ? <span className="text-xs text-rose-600">No direct equivalent</span> : (
                    <ul className="space-y-0.5">
                      {r.targets.map((t) => <li key={t.code} className="text-xs"><span className="font-mono font-semibold" style={{ color: fb.color }}>{t.code}</span> <span className="text-slate-600">{t.title}</span></li>)}
                    </ul>
                  )}
                </td>
                <td className="text-xs">
                  {r.controls.map((id) => <Link key={id} href={`/app/controls/${id}`} className="mr-1 inline-block rounded bg-brand-50 px-1.5 py-0.5 font-mono font-semibold text-brand-700 hover:underline">{id}</Link>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

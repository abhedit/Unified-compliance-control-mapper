import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace";
import CustomControlBuilder from "@/components/CustomControlBuilder";
import { FrameworkBadge, PageHeader, StatusBadge } from "@/components/ui";
import type { FrameworkId } from "@/data/frameworks";

export const metadata = { title: "Custom controls" };

export default async function CustomPage() {
  const { frameworks, controls, status } = await loadWorkspace();
  const custom = controls.filter((c) => c.custom);
  return (
    <div>
      <PageHeader title="Custom controls" subtitle="Add controls unique to your environment. Describe the control in plain language and we suggest the framework requirements it satisfies." />
      <CustomControlBuilder enabled={frameworks} />
      <h2 className="mt-10 mb-3 font-semibold">Your custom controls ({custom.length})</h2>
      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead><tr><th>Control</th><th>Mappings</th><th>Status</th></tr></thead>
          <tbody>
            {custom.map((c) => (
              <tr key={c.id}>
                <td><Link href={`/app/controls/${c.id}`} className="hover:underline"><span className="font-mono text-xs font-semibold text-violet-700">{c.id}</span> <span className="font-medium">{c.name}</span></Link></td>
                <td><div className="flex flex-wrap gap-1">{(Object.entries(c.map) as [FrameworkId, string[]][]).flatMap(([f, codes]) => codes.map((code) => <FrameworkBadge key={f + code} id={f} code={code} />))}</div></td>
                <td><StatusBadge status={status[c.id] ?? "not_started"} /></td>
              </tr>
            ))}
            {custom.length === 0 && <tr><td colSpan={3} className="py-6 text-center text-slate-500">No custom controls yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

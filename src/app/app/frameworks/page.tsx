import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace";
import { coverage } from "@/lib/mapper";
import { FRAMEWORKS } from "@/data/frameworks";
import { PageHeader, Progress } from "@/components/ui";

export const metadata = { title: "Frameworks" };

export default async function FrameworksPage() {
  const { frameworks, controls, status } = await loadWorkspace();
  return (
    <div>
      <PageHeader title="Frameworks" subtitle="Readiness for each framework is computed from the status of the unified controls mapped to it." actions={<Link href="/app/settings" className="btn-secondary">Manage frameworks</Link>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {FRAMEWORKS.map((f) => {
          const on = frameworks.includes(f.id);
          const cov = coverage(controls, f.id, status);
          return (
            <Link key={f.id} href={`/app/frameworks/${f.id}`} className={`card p-5 transition hover:shadow-md ${on ? "" : "opacity-60"}`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold" style={{ color: f.color }}>{f.name}</span>
                {on ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">In scope</span> : <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Preview</span>}
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-500">{f.description}</p>
              <div className="mt-4 flex items-end justify-between text-sm">
                <span className="text-slate-500">{cov.met}/{cov.total} met · {cov.gap} gaps</span>
                <span className="text-xl font-bold" style={{ color: f.color }}>{cov.percent}%</span>
              </div>
              <Progress value={cov.percent} color={f.color} className="mt-2" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

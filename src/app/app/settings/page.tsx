import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace";
import { listApiKeys } from "@/lib/org";
import { FRAMEWORKS } from "@/data/frameworks";
import { PageHeader, fmtDate } from "@/components/ui";
import ApiKeyForm from "@/components/ApiKeyForm";
import { revokeApiKeyAction, saveFrameworksAction } from "../actions";

const REGIONS = ["Global", "India", "US", "EU", "UK"] as const;

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { session, frameworks } = await loadWorkspace();
  const keys = listApiKeys(session.orgId);
  return (
    <div className="max-w-4xl">
      <PageHeader title="Settings" subtitle={`Workspace: ${session.orgName}`} />
      <form action={saveFrameworksAction} className="card p-5">
        <h2 className="font-semibold">Frameworks in scope</h2>
        <p className="text-xs text-slate-500">Readiness, gaps and the mapper are scoped to these frameworks. Control status is shared across all of them. <Link href="/app/obligations" className="font-semibold text-brand-600">Work out what applies →</Link></p>
        {REGIONS.map((region) => (
        <div key={region} className="mt-4">
        <h3 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">{region}</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {FRAMEWORKS.filter((f) => f.region === region).map((f) => (
            <label key={f.id} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
              <input type="checkbox" name="frameworks" value={f.id} defaultChecked={frameworks.includes(f.id)} className="mt-1" />
              <span><span className="font-medium" style={{ color: f.color }}>{f.name}</span><span className="block text-xs text-slate-500">{f.kind} · {f.requirements.length} requirements · {f.version}</span></span>
            </label>
          ))}
        </div>
        </div>
        ))}
        <button className="btn-primary mt-4">Save frameworks</button>
      </form>

      <div className="card mt-6 p-5">
        <h2 className="font-semibold">API keys</h2>
        <p className="mb-3 text-xs text-slate-500">Use workspace keys to read coverage and gap data from the REST API. <Link href="/docs" className="font-semibold text-brand-600">API docs →</Link></p>
        <ApiKeyForm />
        <table className="table-base mt-4">
          <thead><tr><th>Name</th><th>Key</th><th>Created</th><th>Last used</th><th /></tr></thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id}>
                <td>{k.name}</td><td className="font-mono text-xs">{k.prefix}…</td><td>{fmtDate(k.created_at)}</td><td>{fmtDate(k.last_used_at)}</td>
                <td><form action={revokeApiKeyAction}><input type="hidden" name="id" value={k.id} /><button className="text-xs text-rose-600 hover:underline">Revoke</button></form></td>
              </tr>
            ))}
            {keys.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-slate-500">No API keys.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

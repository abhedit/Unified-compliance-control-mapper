import MarketingNav from "@/components/MarketingNav";
import SiteFooter from "@/components/SiteFooter";

export const metadata = { title: "API documentation" };

const ENDPOINTS = [
  { method: "GET", path: "/api/v1/frameworks", auth: "Public", desc: "List supported frameworks. Add ?include=requirements for every requirement.", example: "curl https://app.abhedit.com/control-mapper/api/v1/frameworks" },
  { method: "GET", path: "/api/v1/controls", auth: "Public", desc: "Unified control library with mappings. Filter with ?framework=pci4.", example: "curl https://app.abhedit.com/control-mapper/api/v1/controls?framework=pci4" },
  { method: "GET", path: "/api/v1/map", auth: "Public", desc: "Map one requirement (?framework=&code=) or one control (?control=) across all frameworks.", example: 'curl "https://app.abhedit.com/control-mapper/api/v1/map?framework=iso27001&code=A.8.5"' },
  { method: "GET", path: "/api/v1/workspace/coverage", auth: "API key", desc: "Readiness and per-requirement status for your in-scope frameworks (or ?framework=).", example: 'curl -H "Authorization: Bearer ucm_live_…" https://app.abhedit.com/control-mapper/api/v1/workspace/coverage?framework=soc2' },
  { method: "GET", path: "/api/v1/workspace/controls", auth: "API key", desc: "All library and custom controls with your status and owners.", example: 'curl -H "Authorization: Bearer ucm_live_…" https://app.abhedit.com/control-mapper/api/v1/workspace/controls' },
];

export default function Docs() {
  return (
    <div className="bg-white">
      <MarketingNav />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight">REST API</h1>
        <p className="mt-2 text-slate-600">
          Read-only JSON API. Public endpoints expose the mapping library; workspace endpoints require an API key created under <b>Settings &amp; API</b>, sent as a Bearer token.
        </p>
        <div className="mt-8 space-y-5">
          {ENDPOINTS.map((e) => (
            <div key={e.path} className="card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-emerald-100 px-2 py-0.5 font-mono text-xs font-bold text-emerald-700">{e.method}</span>
                <code className="font-mono text-sm font-semibold">{e.path}</code>
                <span className={`ml-auto rounded-full px-2 py-0.5 text-xs ${e.auth === "Public" ? "bg-slate-100 text-slate-600" : "bg-amber-100 text-amber-800"}`}>{e.auth}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{e.desc}</p>
              <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">{e.example}</pre>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

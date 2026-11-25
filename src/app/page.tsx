import Link from "next/link";
import MarketingNav from "@/components/MarketingNav";
import { FrameworkBadge, Logo } from "@/components/ui";
import { FRAMEWORKS, type FrameworkId } from "@/data/frameworks";
import { CONTROLS, CONTROL_BY_ID } from "@/data/controls";
import { overlap } from "@/lib/mapper";

const FEATURES = [
  { icon: "🔗", title: "Map one control, everywhere", body: "Pick any requirement — ISO A.8.5, SOC 2 CC6.1, PCI 8.4 — and instantly see every equivalent requirement across all frameworks, linked through a single unified control." },
  { icon: "📊", title: "Multi-framework readiness", body: "Track each control's status once. Readiness for ISO 27001, SOC 2, HIPAA and more updates automatically, with met / partial / gap per requirement." },
  { icon: "🧮", title: "Crosswalk matrix", body: "Generate an A→B crosswalk between any two frameworks and see the overlap before you take on a new certification. Export to CSV for your auditor." },
  { icon: "✨", title: "Smart custom-control mapping", body: "Describe your own control in plain language; the similarity engine suggests the requirements it satisfies and flags duplicates in the library." },
  { icon: "📎", title: "Evidence once, reused many times", body: "Attach evidence to the unified control and it counts towards every mapped requirement — no more uploading the same screenshot five times." },
  { icon: "🔌", title: "API-first", body: "Pull mappings, coverage and gap data into your GRC stack, data warehouse or CI pipeline via a simple REST API with workspace keys." },
];

const PLANS = [
  { name: "Free", price: "$0", per: "forever", cta: "Use the free mapper", href: "/map", features: ["Public cross-framework mapper", "All 9 frameworks", "CSV export per mapping", "Shareable mapping links"] },
  { name: "Startup", price: "$149", per: "/month", cta: "Start 14-day trial", href: "/signup", highlight: true, features: ["1 workspace, 5 users", "Up to 3 active frameworks", "Readiness dashboards & gap analysis", "Evidence tracking", "Custom controls (25)", "Crosswalk exports"] },
  { name: "Growth", price: "$399", per: "/month", cta: "Start 14-day trial", href: "/signup", features: ["Unlimited users", "All frameworks", "Unlimited custom controls", "REST API access", "Auditor-ready SoA exports", "Priority support"] },
  { name: "Enterprise / Partner", price: "Custom", per: "", cta: "Talk to abhedit", href: "/signup", features: ["Multi-entity & MSP / consultant mode", "SSO / SAML", "Custom framework import", "Dedicated mapping review", "Private deployment option"] },
];

export default function Home() {
  const totalReqs = FRAMEWORKS.reduce((n, f) => n + f.requirements.length, 0);
  const links = CONTROLS.reduce((n, c) => n + Object.values(c.map).reduce((m, v) => m + (v?.length ?? 0), 0), 0);
  const mfa = CONTROL_BY_ID["IAM-04"];
  const pairs: [FrameworkId, FrameworkId][] = [["iso27001", "soc2"], ["soc2", "iso27001"], ["iso27001", "csf2"], ["soc2", "hipaa"], ["iso27001", "pci4"], ["gdpr", "dpdp"]];

  return (
    <div className="bg-white">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_#e0e7ff_0%,_transparent_60%)]" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-16 pb-20 lg:grid-cols-2 lg:pt-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              New · NIST CSF 2.0, PCI DSS 4.0 &amp; India DPDP Act mappings
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Implement a control once.<br />
              <span className="text-brand-600">Comply with every framework.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              abhedit UCM is a unified compliance control mapper. One library of {CONTROLS.length} unified controls, mapped to {totalReqs} requirements across ISO 27001, SOC 2,
              NIST, HIPAA, PCI DSS, GDPR, CIS and DPDP — so your team stops doing the same compliance work twice.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary px-6 py-3 text-base">Start free trial</Link>
              <Link href="/map" className="btn-secondary px-6 py-3 text-base">Try the free mapper →</Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6">
              {[[FRAMEWORKS.length, "frameworks"], [CONTROLS.length, "unified controls"], [links, "mapping links"]].map(([v, l]) => (
                <div key={String(l)}>
                  <dt className="text-3xl font-bold text-slate-900">{v}</dt>
                  <dd className="text-sm text-slate-500">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Mapping preview card */}
          <div className="card self-center p-6 shadow-xl shadow-brand-100">
            <div className="text-xs font-semibold tracking-wide text-brand-600 uppercase">Unified control · {mfa.domain}</div>
            <div className="mt-1 text-xl font-bold"><span className="font-mono">{mfa.id}</span> · {mfa.name}</div>
            <p className="mt-2 text-sm text-slate-600">{mfa.description}</p>
            <div className="mt-5 space-y-2.5">
              {(Object.entries(mfa.map) as [FrameworkId, string[]][]).map(([fw, codes]) => (
                <div key={fw} className="flex flex-wrap items-center gap-1.5">
                  {codes.map((c) => <FrameworkBadge key={c} id={fw} code={c} />)}
                </div>
              ))}
            </div>
            <Link href="/map?control=IAM-04" className="mt-5 inline-block text-sm font-semibold text-brand-600 hover:underline">Explore this mapping →</Link>
          </div>
        </div>
      </section>

      {/* Frameworks */}
      <section id="frameworks" className="border-y border-slate-100 bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight">Every framework your customers ask for</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">Start with SOC 2 or ISO 27001 and see how much of the next framework you&apos;ve already done.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FRAMEWORKS.map((f) => (
              <Link key={f.id} href={`/map?fw=${f.id}&code=${encodeURIComponent(f.requirements[0].code)}`} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-semibold" style={{ color: f.color }}>{f.name}</span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{f.category}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{f.description}</p>
                <div className="mt-3 text-xs text-slate-400">{f.requirements.length} requirements · {f.publisher}</div>
              </Link>
            ))}
          </div>
          <div className="mx-auto mt-12 max-w-3xl">
            <h3 className="text-center text-lg font-semibold">Already certified? Here&apos;s your head start</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {pairs.map(([a, b]) => {
                const pct = Math.round(overlap(CONTROLS, b, a) * 100);
                const fa = FRAMEWORKS.find((f) => f.id === a)!;
                const fb = FRAMEWORKS.find((f) => f.id === b)!;
                return (
                  <div key={`${a}${b}`} className="card flex items-center justify-between p-4 text-sm">
                    <span>Have <b>{fa.shortName}</b> → <b>{fb.shortName}</b></span>
                    <span className="text-lg font-bold text-brand-600">{pct}%</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-center text-xs text-slate-400">Share of target-framework requirements touched by controls shared with the source framework.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight">Built around a unified control framework</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
            The same &ldquo;map once, comply many&rdquo; model leading GRC platforms use — delivered as a focused, transparent and affordable mapper.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6">
                <div className="text-2xl">{f.icon}</div>
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>

          <div className="card mt-16 overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr><th>Why teams pick abhedit UCM</th><th>Typical all-in-one compliance suites</th><th className="text-brand-700!">abhedit UCM</th></tr>
              </thead>
              <tbody>
                {[
                  ["Mapping transparency", "Mappings mostly visible after purchase", "Public, explorable crosswalk with shareable links"],
                  ["Regional coverage", "US/EU-centric framework catalogs", "India DPDP Act included alongside GDPR, HIPAA, PCI"],
                  ["Price point", "Annual contracts, often five figures", "Self-serve monthly plans; free mapper forever"],
                  ["Consultants & MSPs", "Partner programs vary", "Partner plan for running many client workspaces"],
                  ["Data access", "API on higher tiers", "REST API for mappings, coverage and gaps"],
                ].map(([a, b, c]) => (
                  <tr key={a}><td className="font-medium">{a}</td><td className="text-slate-500">{b}</td><td className="font-medium text-slate-800">✓ {c}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight">Simple pricing</h2>
          <p className="mt-2 text-center text-slate-600">Start free. Upgrade when you start tracking readiness.</p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((p) => (
              <div key={p.name} className={`card flex flex-col p-6 ${p.highlight ? "ring-2 ring-brand-500" : ""}`}>
                {p.highlight && <span className="mb-2 self-start rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">Most popular</span>}
                <h3 className="font-semibold">{p.name}</h3>
                <div className="mt-2"><span className="text-3xl font-bold">{p.price}</span><span className="text-sm text-slate-500">{p.per}</span></div>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-600">
                  {p.features.map((f) => <li key={f}>✓ {f}</li>)}
                </ul>
                <Link href={p.href} className={`${p.highlight ? "btn-primary" : "btn-secondary"} mt-6`}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 md:flex-row">
          <Logo />
          <p className="max-w-xl text-center text-xs md:text-right">
            Mappings are reference crosswalks to help plan compliance work and do not constitute legal advice or certification. Framework names are trademarks of their respective owners.
            Licensed standard text (e.g. ISO/IEC 27001) must be obtained from the publisher.
          </p>
        </div>
      </footer>
    </div>
  );
}

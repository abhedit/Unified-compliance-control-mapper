import Link from "next/link";
import { ArrowRight, BrainCircuit, Code2, GitCompareArrows, Network, Paperclip, Scale, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import SiteFooter from "@/components/SiteFooter";
import { FrameworkBadge, RelBadge } from "@/components/ui";
import { FRAMEWORKS, type FrameworkId } from "@/data/frameworks";
import { CONTROLS, CONTROL_BY_ID } from "@/data/controls";
import { CORROBORATED } from "@/data/provenance";
import { overlap } from "@/lib/mapper";

const FEATURES = [
  { icon: Scale, title: "Know what applies", body: "A short company profile tells you which laws, regulations and standards are mandatory, expected by customers or recommended — with the reason for each." },
  { icon: Network, title: "Map one control, everywhere", body: "Pick any requirement — ISO A.8.5, SOC 2 CC6.1, PCI 8.4, DORA Art. 9 — and see every corresponding requirement with its match strength." },
  { icon: ShieldCheck, title: "Standards-based mapping", body: "Every link carries a NIST IR 8477 relationship type, is anchored to the Secure Controls Framework and passes automated integrity gates." },
  { icon: Workflow, title: "Multi-framework readiness", body: "Track each control once. Readiness for every in-scope framework updates automatically, with met / partial / gap per requirement." },
  { icon: GitCompareArrows, title: "Crosswalks & SoA exports", body: "Compare any two frameworks and export auditor-ready crosswalks and Statements of Applicability with justifications." },
  { icon: BrainCircuit, title: "AI governance built in", body: "ISO/IEC 42001 and the EU AI Act are mapped to dedicated AI controls — inventory, impact assessment, oversight and incident reporting." },
  { icon: Paperclip, title: "Evidence once, reused", body: "Attach evidence to the unified control and it counts toward every mapped requirement across all frameworks." },
  { icon: Sparkles, title: "Custom controls", body: "Describe your own control in plain language; the similarity engine suggests the requirements it satisfies and flags duplicates." },
  { icon: Code2, title: "API-first", body: "Pull mappings, coverage and gaps into your GRC stack, data warehouse or CI pipeline through a REST API." },
];

const PLANS = [
  { name: "Free", price: "$0", per: "forever", cta: "Use the free mapper", href: "/map", features: ["Public cross-framework mapper", "Applicability assessment", "All 23 frameworks", "CSV export per mapping"] },
  { name: "Startup", price: "$149", per: "/month", cta: "Start 14-day trial", href: "/signup", highlight: true, features: ["1 workspace, 5 users", "Up to 3 active frameworks", "Readiness dashboards & gap analysis", "Evidence tracking", "Custom controls (25)", "Crosswalk exports"] },
  { name: "Growth", price: "$399", per: "/month", cta: "Start 14-day trial", href: "/signup", features: ["Unlimited users", "All frameworks", "Unlimited custom controls", "REST API access", "Auditor-ready SoA exports", "Priority support"] },
  { name: "Enterprise / Partner", price: "Custom", per: "", cta: "Talk to Abhedit", href: "mailto:contact@abhedit.com", features: ["Multi-entity & MSP / consultant mode", "SSO / SAML", "Custom framework import", "Dedicated mapping review", "Private deployment option"] },
];

const REGIONS = ["Global", "India", "US", "EU", "UK"] as const;

export default function Home() {
  const totalReqs = FRAMEWORKS.reduce((n, f) => n + f.requirements.length, 0);
  const links = CONTROLS.reduce((n, c) => n + Object.values(c.map).reduce((m, v) => m + (v?.length ?? 0), 0), 0);
  const mfa = CONTROL_BY_ID["IAM-04"];
  const pairs: [FrameworkId, FrameworkId][] = [["iso27001", "soc2"], ["iso27001", "nist800171"], ["iso27001", "dora"], ["iso27001", "nis2"], ["gdpr", "dpdp"], ["iso42001", "euaiact"]];

  return (
    <div className="bg-white">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-32 text-center sm:pt-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_#dbeeff_0%,_transparent_55%)]" />
        <span className="eyebrow">Abhedit Control Mapper · Security · Privacy · Compliance · AI Governance</span>
        <h1 className="display text-gradient mx-auto mt-5 max-w-5xl text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
          Implement a control once. Comply with every framework.
        </h1>
        <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-slate-600 sm:text-xl">
          One unified library of {CONTROLS.length} controls, mapped to {totalReqs} requirements across {FRAMEWORKS.length} security, privacy, financial and AI regulations in India, the US, the EU and the UK —
          so your team stops doing the same compliance work twice.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/assess" className="btn-dark px-6 py-4 text-base">What applies to my company? <ArrowRight size={18} className="text-brand-500" /></Link>
          <Link href="/signup" className="btn-primary px-6 py-4 text-base">Start free <ArrowRight size={18} /></Link>
        </div>
        <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
          {[[FRAMEWORKS.length, "frameworks"], [CONTROLS.length, "unified controls"], [links, "typed mapping links"], [`${Math.round((100 * CORROBORATED.size) / links)}%`, "independently corroborated"]].map(([v, l]) => (
            <div key={String(l)}>
              <dt className="display text-4xl text-ink">{v}</dt>
              <dd className="mt-1 text-sm text-slate-500">{l}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Product preview over the ink band */}
      <section className="bg-ink px-4 pb-20">
        <div className="mx-auto -mt-20 max-w-4xl rounded-lg bg-white p-6 text-left shadow-[0_18px_40px_#0f172a40] sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="eyebrow">Unified control · {mfa.domain}</span>
              <div className="display mt-2 text-2xl text-ink"><span className="font-mono">{mfa.id}</span> · {mfa.name}</div>
            </div>
            <RelBadge rel="equal" />
          </div>
          <p className="mt-2 text-sm text-slate-600">{mfa.description}</p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {(Object.entries(mfa.map) as [FrameworkId, string[]][]).flatMap(([fw, codes]) => codes.map((c) => <FrameworkBadge key={fw + c} id={fw} code={c} />))}
          </div>
          <Link href="/map?control=IAM-04" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">Explore this mapping <ArrowRight size={15} /></Link>
        </div>

        <div id="frameworks" className="mx-auto mt-24 max-w-7xl text-white">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow text-brand-500!">Coverage</span>
            <h2 className="display mt-3 text-4xl sm:text-5xl">Every regime your company has to follow</h2>
            <p className="mt-4 text-slate-300">Certifications, privacy laws, financial-sector regulation and AI governance — mapped once, tracked together.</p>
          </div>
          <div className="mt-12 space-y-10">
            {REGIONS.map((region) => (
              <div key={region}>
                <h3 className="mb-3 text-xs font-bold tracking-[0.075em] text-brand-500 uppercase">{region}</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {FRAMEWORKS.filter((f) => f.region === region).map((f) => (
                    <Link key={f.id} href={`/map?fw=${f.id}&code=${encodeURIComponent(f.requirements[0].code)}`}
                      className="group rounded bg-ink-soft p-5 transition hover:-translate-y-0.5 hover:bg-[#25324a]">
                      <div className="text-[11px] text-slate-400">{f.kind}</div>
                      <div className="mt-1 font-semibold text-white">{f.shortName}</div>
                      <div className="mt-1 line-clamp-2 text-xs text-slate-400">{f.name}</div>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-slate-300">{f.requirements.length} requirements</span>
                        <ArrowRight size={15} className="text-brand-500 transition group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">The platform</span>
            <h2 className="display mt-3 text-4xl text-brand-700 sm:text-5xl">Built around a unified control framework</h2>
            <p className="mt-4 text-slate-600">The &ldquo;map once, comply many&rdquo; model used by enterprise GRC programmes — transparent, standards-based and affordable.</p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded border border-slate-200 p-6 shadow-[0_5px_18px_#0f172a08] transition hover:-translate-y-0.5 hover:shadow-[0_12px_25px_#0f172a12]">
                <div className="grid h-10 w-10 place-items-center rounded bg-brand-50 text-brand-700"><Icon size={20} /></div>
                <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-20 max-w-4xl">
            <h3 className="display text-center text-3xl text-ink">Already compliant with one? Here&apos;s your head start</h3>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {pairs.map(([a, b]) => {
                const pct = Math.round(overlap(CONTROLS, b, a) * 100);
                const fa = FRAMEWORKS.find((f) => f.id === a)!;
                const fb = FRAMEWORKS.find((f) => f.id === b)!;
                return (
                  <div key={`${a}${b}`} className="flex items-center justify-between rounded border border-slate-200 p-4 text-sm">
                    <span>Have <b>{fa.shortName}</b> <ArrowRight size={13} className="inline text-brand-600" /> <b>{fb.shortName}</b></span>
                    <span className="display text-2xl text-brand-700">{pct}%</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-center text-xs text-slate-500">Share of the target framework&apos;s requirements with a non-supporting counterpart through shared controls.</p>
          </div>

          <div className="mt-20 overflow-x-auto rounded border border-slate-200">
            <table className="table-base">
              <thead>
                <tr><th>Why teams choose Abhedit</th><th>Typical all-in-one compliance suites</th><th className="text-brand-700!">Abhedit Control Mapper</th></tr>
              </thead>
              <tbody>
                {[
                  ["Mapping transparency", "Mappings mostly visible after purchase", "Public crosswalk with NIST IR 8477 relationship types and per-link provenance"],
                  ["Regional coverage", "US/EU-centric framework catalogs", "India DPDP, CERT-In and SPDI alongside GDPR, NIS2, DORA, HIPAA and PCI"],
                  ["Applicability", "Frameworks chosen manually", "Profile-based assessment of mandatory, expected and recommended frameworks"],
                  ["Price point", "Annual contracts, often five figures", "Self-serve monthly plans; free mapper forever"],
                  ["Data access", "API on higher tiers", "REST API for mappings, coverage and gaps"],
                ].map(([a, b, c]) => (
                  <tr key={a}><td className="font-medium">{a}</td><td className="text-slate-500">{b}</td><td className="font-medium text-ink">✓ {c}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-slate-100 bg-slate-50 px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="eyebrow">Pricing</span>
            <h2 className="display mt-3 text-4xl text-ink sm:text-5xl">Simple, transparent pricing</h2>
            <p className="mt-3 text-slate-600">Start free. Upgrade when you start tracking readiness.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((p) => (
              <div key={p.name} className={`flex flex-col rounded border bg-white p-6 ${p.highlight ? "border-brand-600 shadow-[0_12px_30px_#047fff26]" : "border-slate-200"}`}>
                {p.highlight && <span className="eyebrow mb-2">Most popular</span>}
                <h3 className="font-semibold text-ink">{p.name}</h3>
                <div className="mt-2"><span className="display text-4xl text-ink">{p.price}</span><span className="text-sm text-slate-500">{p.per}</span></div>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-600">
                  {p.features.map((f) => <li key={f} className="flex gap-2"><span className="text-brand-600">•</span>{f}</li>)}
                </ul>
                <Link href={p.href} className={`${p.highlight ? "btn-primary" : "btn-dark"} mt-6`}>{p.cta} <ArrowRight size={15} /></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo banner */}
      <section className="px-4 py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 rounded bg-brand-600 px-6 py-5 text-lg font-semibold text-white sm:flex-row">
          <span>See your full compliance scope — and the controls that cover it — in two minutes.</span>
          <Link href="/assess" className="inline-flex items-center gap-2 rounded bg-ink px-4 py-2.5 text-sm whitespace-nowrap hover:bg-ink-soft">
            Run the assessment <ArrowRight size={15} className="text-brand-500" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

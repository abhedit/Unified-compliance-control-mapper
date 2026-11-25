import Link from "next/link";
import MarketingNav from "@/components/MarketingNav";
import { RelBadge } from "@/components/ui";
import { CONTROLS, LIBRARY_VERSION } from "@/data/controls";
import { FRAMEWORKS } from "@/data/frameworks";
import { CORROBORATED, REFERENCE } from "@/data/provenance";
import { REL_META, buildIndex, key, relationship, type Relationship } from "@/lib/mapper";

export const metadata = { title: "Mapping methodology" };

const STEPS = [
  ["Authoritative intake", "Requirement catalogs are built from the official publications at the granularity auditors test, and checked for completeness against a reference universe. NIST 800-53 titles come from NIST's OSCAL catalog."],
  ["Common control design", "Requirements map to unified controls, each with a testable statement, evidence guidance, review frequency and automation flag. This avoids maintaining N² pairwise crosswalks."],
  ["Relationship typing", "Every link carries a NIST IR 8477 set-theory relationship, so “maps to” always states whether a control fully, partially or only supportively covers a requirement."],
  ["Independent corroboration", "Each control is anchored to Secure Controls Framework controls. A reconciliation compares our links with the reference crosswalk; analyst-only and reference-only links are each reviewed by hand."],
  ["Automated integrity gates", "CI blocks any change that breaks the rules: every mapped code exists, every requirement has non-supportive coverage, relationships and provenance are consistent."],
  ["Versioned change control", "The library is versioned and every change is logged. Framework or reference updates trigger a re-review and QA re-run."],
];

export default function Methodology() {
  const index = buildIndex(CONTROLS);
  const relCount: Record<Relationship, number> = { equal: 0, subset_of: 0, superset_of: 0, intersects_with: 0 };
  const rows = FRAMEWORKS.map((f) => {
    let full = 0, links = 0, corr = 0;
    for (const r of f.requirements) {
      const linked = index.get(key(f.id, r.code)) ?? [];
      const rels = linked.map((c) => relationship(c, f.id, r.code));
      rels.forEach((x) => relCount[x]++);
      links += linked.length;
      corr += linked.filter((c) => CORROBORATED.has(`${c.id}|${f.id}|${r.code}`)).length;
      if (rels.some((x) => REL_META[x].full)) full++;
    }
    return { f, full, links, corr };
  });
  const totalLinks = rows.reduce((n, r) => n + r.links, 0);

  return (
    <div className="bg-white">
      <MarketingNav />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">Library v{LIBRARY_VERSION}</span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">How we map controls</h1>
        <p className="mt-3 max-w-3xl text-lg text-slate-600">
          abhedit UCM follows the procedure enterprise GRC teams use: one common control framework, mapping relationships typed per{" "}
          <b>NIST IR 8477</b>, independent corroboration against the <b>{REFERENCE.name}</b>, and automated integrity gates on every change.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          {[
            [CONTROLS.length, "unified controls"],
            [FRAMEWORKS.reduce((n, f) => n + f.requirements.length, 0), "requirements"],
            [totalLinks, "typed mapping links"],
            [`${Math.round((100 * CORROBORATED.size) / totalLinks)}%`, `corroborated by ${REFERENCE.version}`],
          ].map(([v, l]) => (
            <div key={String(l)} className="card p-4">
              <div className="text-2xl font-bold">{v}</div>
              <div className="text-sm text-slate-500">{l}</div>
            </div>
          ))}
        </div>

        <h2 className="mt-12 text-xl font-bold">The procedure</h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-2">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="card p-5">
              <div className="text-xs font-semibold text-brand-600">STEP {i + 1}</div>
              <div className="mt-1 font-semibold">{t}</div>
              <p className="mt-1 text-sm text-slate-600">{d}</p>
            </li>
          ))}
        </ol>

        <h2 className="mt-12 text-xl font-bold">Relationship types</h2>
        <p className="mt-1 text-sm text-slate-600">Each link reads “⟨requirement⟩ is ⟨relationship⟩ ⟨control⟩”.</p>
        <div className="card mt-4 overflow-x-auto">
          <table className="table-base">
            <thead><tr><th>Relationship</th><th>Meaning</th><th>Coverage effect</th><th className="text-right">Links</th></tr></thead>
            <tbody>
              {(Object.keys(REL_META) as Relationship[]).map((r) => (
                <tr key={r}>
                  <td><RelBadge rel={r} /></td>
                  <td className="text-slate-600">{REL_META[r].help}</td>
                  <td className="text-slate-600">{REL_META[r].full ? "Satisfies the requirement alone" : r === "superset_of" ? "Satisfies it together with the other required controls" : "Supportive only — never required"}</td>
                  <td className="text-right font-semibold">{relCount[r]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-12 text-xl font-bold">Coverage by framework</h2>
        <div className="card mt-4 overflow-x-auto">
          <table className="table-base">
            <thead><tr><th>Framework</th><th>Version</th><th className="text-right">Requirements</th><th className="text-right">Single-control coverage</th><th className="text-right">Links</th><th className="text-right">SCF-corroborated</th></tr></thead>
            <tbody>
              {rows.map(({ f, full, links, corr }) => (
                <tr key={f.id}>
                  <td className="font-medium" style={{ color: f.color }}>{f.name}</td>
                  <td className="text-slate-500">{f.version}</td>
                  <td className="text-right">{f.requirements.length}</td>
                  <td className="text-right">{full}</td>
                  <td className="text-right">{links}</td>
                  <td className="text-right">{Math.round((100 * corr) / links)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Every requirement has at least one non-supportive mapping. Links not corroborated by the reference are analyst-asserted and individually reviewed; they are labelled in the product so auditors can review them first.
        </p>

        <h2 className="mt-12 text-xl font-bold">Readiness and Statement of Applicability</h2>
        <p className="mt-2 text-sm text-slate-600">
          A requirement is <b>met</b> when any fully-covering control is implemented, or when every required partial control is implemented. Supportive links never block it.
          Controls excluded as <b>Not applicable</b> require a written justification, which flows into the exported Statement of Applicability (ISO/IEC 27001 §6.1.3(d)).
        </p>

        <div className="mt-10 rounded-xl bg-slate-50 p-5 text-xs text-slate-500">
          References: NIST IR 8477 (Mapping Relationships Between Documentary Standards, Regulations, Frameworks, and Guidelines); NIST OLIR; NIST SP 800-53 Rev. 5 OSCAL catalog;
          {" "}{REFERENCE.name} {REFERENCE.version} (CC BY-ND 4.0, used as a reference only). Mappings support planning and evidence reuse and are not an audit opinion or certification.
          Requirement titles are paraphrased; licensed standards must be obtained from their publishers.{" "}
          <Link href="/map" className="font-semibold text-brand-600">Explore the mapper →</Link>
        </div>
      </main>
    </div>
  );
}

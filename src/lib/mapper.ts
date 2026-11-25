// Pure mapping engine: no I/O. Works on any list of controls (library + custom).
import { FRAMEWORKS, FRAMEWORK_BY_ID, type FrameworkId, type Requirement } from "@/data/frameworks";
import type { UnifiedControl } from "@/data/controls";

export type ControlStatus = "not_started" | "in_progress" | "implemented" | "not_applicable";
export type ReqStatus = "met" | "partial" | "gap" | "not_applicable";

export interface ControlLike {
  id: string;
  name: string;
  domain: string;
  description: string;
  map: UnifiedControl["map"];
  custom?: boolean;
}

export const key = (fw: FrameworkId, code: string) => `${fw}:${code}`;

export function buildIndex(controls: ControlLike[]) {
  const byReq = new Map<string, ControlLike[]>();
  for (const c of controls) {
    for (const [fw, codes] of Object.entries(c.map) as [FrameworkId, string[]][]) {
      for (const code of codes) {
        const k = key(fw, code);
        const list = byReq.get(k) ?? [];
        list.push(c);
        byReq.set(k, list);
      }
    }
  }
  return byReq;
}

export function findRequirement(fw: FrameworkId, code: string): Requirement | undefined {
  return FRAMEWORK_BY_ID[fw]?.requirements.find((r) => r.code === code);
}

export interface Equivalent {
  framework: FrameworkId;
  code: string;
  title: string;
  via: string[]; // control ids linking the requirement
}

/** Map one requirement across all other frameworks via shared unified controls. */
export function equivalentsForRequirement(controls: ControlLike[], fw: FrameworkId, code: string) {
  const index = buildIndex(controls);
  const linked = index.get(key(fw, code)) ?? [];
  return { controls: linked, equivalents: equivalentsForControls(linked, fw, code) };
}

/** All requirements touched by a set of controls, grouped by framework. */
export function equivalentsForControls(linked: ControlLike[], excludeFw?: FrameworkId, excludeCode?: string) {
  const out = new Map<string, Equivalent>();
  for (const c of linked) {
    for (const [f, codes] of Object.entries(c.map) as [FrameworkId, string[]][]) {
      for (const code of codes) {
        if (f === excludeFw && code === excludeCode) continue;
        const k = key(f, code);
        const existing = out.get(k);
        if (existing) existing.via.push(c.id);
        else out.set(k, { framework: f, code, title: findRequirement(f, code)?.title ?? code, via: [c.id] });
      }
    }
  }
  const grouped: Partial<Record<FrameworkId, Equivalent[]>> = {};
  for (const e of out.values()) (grouped[e.framework] ??= []).push(e);
  for (const fw of Object.keys(grouped) as FrameworkId[]) {
    const order = FRAMEWORK_BY_ID[fw].requirements.map((r) => r.code);
    grouped[fw]!.sort((a, b) => order.indexOf(a.code) - order.indexOf(b.code));
  }
  return grouped;
}

/** Crosswalk A -> B: for each requirement in A, the B requirements sharing a control. */
export function crosswalk(controls: ControlLike[], a: FrameworkId, b: FrameworkId) {
  const index = buildIndex(controls);
  return FRAMEWORK_BY_ID[a].requirements.map((req) => {
    const linked = index.get(key(a, req.code)) ?? [];
    const targets = new Map<string, Set<string>>();
    for (const c of linked) for (const code of c.map[b] ?? []) {
      (targets.get(code) ?? targets.set(code, new Set()).get(code)!).add(c.id);
    }
    const order = FRAMEWORK_BY_ID[b].requirements.map((r) => r.code);
    return {
      requirement: req,
      controls: linked.map((c) => c.id),
      targets: [...targets.entries()]
        .sort((x, y) => order.indexOf(x[0]) - order.indexOf(y[0]))
        .map(([code, via]) => ({ code, title: findRequirement(b, code)?.title ?? code, via: [...via] })),
    };
  });
}

/** Share of A's requirements that are also touched by B (via a shared control). */
export function overlap(controls: ControlLike[], a: FrameworkId, b: FrameworkId) {
  const rows = crosswalk(controls, a, b);
  const hit = rows.filter((r) => r.targets.length > 0).length;
  return rows.length ? hit / rows.length : 0;
}

export function requirementStatus(linked: ControlLike[], status: Record<string, ControlStatus>): ReqStatus {
  const s = linked.map((c) => status[c.id] ?? "not_started").filter((x) => x !== "not_applicable");
  if (linked.length && s.length === 0) return "not_applicable";
  if (s.length === 0) return "gap";
  if (s.every((x) => x === "implemented")) return "met";
  if (s.some((x) => x === "implemented" || x === "in_progress")) return "partial";
  return "gap";
}

export interface CoverageRow {
  requirement: Requirement;
  controls: ControlLike[];
  status: ReqStatus;
}

export function coverage(controls: ControlLike[], fw: FrameworkId, status: Record<string, ControlStatus>) {
  const index = buildIndex(controls);
  const rows: CoverageRow[] = FRAMEWORK_BY_ID[fw].requirements.map((requirement) => {
    const linked = index.get(key(fw, requirement.code)) ?? [];
    return { requirement, controls: linked, status: requirementStatus(linked, status) };
  });
  const counted = rows.filter((r) => r.status !== "not_applicable");
  const met = counted.filter((r) => r.status === "met").length;
  const partial = counted.filter((r) => r.status === "partial").length;
  return {
    rows,
    total: counted.length,
    met,
    partial,
    gap: counted.length - met - partial,
    percent: counted.length ? Math.round(((met + partial * 0.5) / counted.length) * 100) : 0,
  };
}

// ─────────── Suggestion engine (TF-IDF cosine similarity) ───────────

const STOP = new Set(
  "a an and are as at be by for from has have in into is it its of on or that the their this to with within all any each are must shall should be been being such other used using use per not no only than then there these they those via was were will".split(
    " ",
  ),
);
const SYN: Record<string, string> = {
  mfa: "multifactor", "2fa": "multifactor", "multi-factor": "multifactor", authentication: "authenticate",
  authenticated: "authenticate", encrypted: "encrypt", encryption: "encrypt", logs: "log", logging: "log",
  backups: "backup", vendors: "vendor", suppliers: "vendor", supplier: "vendor", third: "vendor",
  vulnerabilities: "vulnerability", vulns: "vulnerability", incidents: "incident", passwords: "password",
  employees: "personnel", staff: "personnel", workforce: "personnel", users: "user", privileged: "privilege",
  privileges: "privilege", admin: "privilege", administrator: "privilege", policies: "policy", risks: "risk",
  changes: "change", trainings: "training", trained: "training", monitored: "monitor", monitoring: "monitor",
  pii: "personal", phi: "personal", ephi: "personal", tls: "transit", firewall: "network", firewalls: "network",
  patches: "patch", patching: "patch", accounts: "account", reviews: "review", reviewed: "review",
};

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((t) => SYN[t] ?? t.replace(/(ing|ed|es|s)$/, (m) => (t.length > 5 ? "" : m)))
    .map((t) => SYN[t] ?? t)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

type Vec = Map<string, number>;
const norm = (v: Vec) => Math.sqrt([...v.values()].reduce((s, x) => s + x * x, 0)) || 1;
function cosine(a: Vec, b: Vec) {
  let dot = 0;
  for (const [t, w] of a) dot += w * (b.get(t) ?? 0);
  return dot / (norm(a) * norm(b));
}

interface Doc { framework: FrameworkId; requirement: Requirement; vec: Vec }

let cachedDocs: { docs: Doc[]; idf: Map<string, number> } | null = null;

function corpus(library: ControlLike[]) {
  if (cachedDocs) return cachedDocs;
  const index = buildIndex(library);
  const raw = FRAMEWORKS.flatMap((f) =>
    f.requirements.map((r) => {
      const linked = index.get(key(f.id, r.code)) ?? [];
      // requirement title weighted x3, enriched by the names of controls that satisfy it
      const text = `${r.title} ${r.title} ${r.title} ${r.group} ${linked.map((c) => c.name).join(" ")}`;
      return { framework: f.id, requirement: r, tokens: tokenize(text) };
    }),
  );
  const df = new Map<string, number>();
  for (const d of raw) for (const t of new Set(d.tokens)) df.set(t, (df.get(t) ?? 0) + 1);
  const idf = new Map([...df].map(([t, n]) => [t, Math.log(1 + raw.length / n)]));
  const docs = raw.map((d) => ({ framework: d.framework, requirement: d.requirement, vec: tfidf(d.tokens, idf) }));
  cachedDocs = { docs, idf };
  return cachedDocs;
}

function tfidf(tokens: string[], idf: Map<string, number>): Vec {
  const v: Vec = new Map();
  for (const t of tokens) v.set(t, (v.get(t) ?? 0) + 1);
  for (const [t, n] of v) v.set(t, n * (idf.get(t) ?? 1));
  return v;
}

export interface Suggestion { framework: FrameworkId; code: string; title: string; score: number }

/** Suggest framework requirements that a free-text control description likely satisfies. */
export function suggestMappings(library: ControlLike[], text: string, perFramework = 4, minScore = 0.12) {
  const { docs, idf } = corpus(library);
  const q = tfidf(tokenize(text), idf);
  const scored = docs.map((d) => ({ d, score: cosine(q, d.vec) })).filter((x) => x.score >= minScore);
  const out: Partial<Record<FrameworkId, Suggestion[]>> = {};
  for (const f of FRAMEWORKS) {
    out[f.id] = scored
      .filter((x) => x.d.framework === f.id)
      .sort((a, b) => b.score - a.score)
      .slice(0, perFramework)
      .map((x) => ({ framework: f.id, code: x.d.requirement.code, title: x.d.requirement.title, score: Math.round(x.score * 100) / 100 }));
  }
  return out;
}

/** Closest existing unified controls to a free-text description (to avoid duplicates). */
export function similarControls(library: ControlLike[], text: string, n = 3) {
  const docs = library.map((c) => ({ c, tokens: tokenize(`${c.name} ${c.name} ${c.description}`) }));
  const df = new Map<string, number>();
  for (const d of docs) for (const t of new Set(d.tokens)) df.set(t, (df.get(t) ?? 0) + 1);
  const idf = new Map([...df].map(([t, k]) => [t, Math.log(1 + docs.length / k)]));
  const q = tfidf(tokenize(text), idf);
  return docs
    .map((d) => ({ control: d.c, score: cosine(q, tfidf(d.tokens, idf)) }))
    .filter((x) => x.score > 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => ({ id: x.control.id, name: x.control.name, score: Math.round(x.score * 100) / 100 }));
}

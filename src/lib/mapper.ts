// Pure mapping engine: no I/O. Works on any list of controls (library + custom).
import { FRAMEWORKS, FRAMEWORK_BY_ID, type FrameworkId, type Requirement } from "../data/frameworks.ts";
import { CONTROLS, type Relationship, type UnifiedControl } from "../data/controls.ts";
import { CORROBORATED } from "../data/provenance.ts";

export type { Relationship };
export type ControlStatus = "not_started" | "in_progress" | "implemented" | "not_applicable";
export type ReqStatus = "met" | "partial" | "gap" | "not_applicable";
export type MatchStrength = "equivalent" | "strong" | "partial" | "weak";

export interface ControlLike {
  id: string;
  name: string;
  domain: string;
  description: string;
  map: UnifiedControl["map"];
  rel?: UnifiedControl["rel"];
  custom?: boolean;
}

export const key = (fw: FrameworkId, code: string) => `${fw}:${code}`;

export const REL_META: Record<Relationship, { symbol: string; label: string; full: boolean; strength: number; help: string }> = {
  equal: { symbol: "=", label: "Equal", full: true, strength: 10, help: "Requirement and control have the same scope." },
  subset_of: { symbol: "⊂", label: "Subset of", full: true, strength: 8, help: "Requirement is fully contained in the control — implementing the control covers it." },
  superset_of: { symbol: "⊃", label: "Superset of", full: false, strength: 5, help: "Requirement is broader — the control covers part of it alongside the other mapped controls." },
  intersects_with: { symbol: "∩", label: "Intersects", full: false, strength: 3, help: "Control supports part of the requirement; it is not required for coverage." },
};

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

// Derived STRM for library links without an explicit relationship:
// a requirement served by exactly one non-supportive control is a subset of it (full coverage);
// a requirement split across several controls is a superset of each (composite coverage).
const LIB_INDEX = buildIndex(CONTROLS);
const DERIVED = new Map<string, Relationship>();
for (const [k, list] of LIB_INDEX) {
  const core = list.filter((c) => c.rel?.[k] !== "intersects_with");
  for (const c of list) DERIVED.set(`${c.id}|${k}`, c.rel?.[k] ?? (core.length === 1 ? "subset_of" : "superset_of"));
}

/** STRM relationship of framework requirement (fw, code) to control c. */
export function relationship(c: ControlLike, fw: FrameworkId, code: string): Relationship {
  const k = key(fw, code);
  return c.rel?.[k] ?? (c.custom ? "superset_of" : (DERIVED.get(`${c.id}|${k}`) ?? "superset_of"));
}

/** Whether an independent reference (SCF) corroborates this library link. */
export const isCorroborated = (controlId: string, fw: FrameworkId, code: string) => CORROBORATED.has(`${controlId}|${fw}|${code}`);

/** How closely two requirements correspond when linked through a common control. */
export function matchStrength(a: Relationship, b: Relationship): MatchStrength {
  if (a === "intersects_with" || b === "intersects_with") return "weak";
  if (a === "equal" && b === "equal") return "equivalent";
  if (REL_META[a].full && REL_META[b].full) return "strong";
  return "partial";
}
const STRENGTH_RANK: Record<MatchStrength, number> = { equivalent: 3, strong: 2, partial: 1, weak: 0 };
export const strongest = (xs: MatchStrength[]) => xs.reduce<MatchStrength>((m, x) => (STRENGTH_RANK[x] > STRENGTH_RANK[m] ? x : m), "weak");

export function findRequirement(fw: FrameworkId, code: string): Requirement | undefined {
  return FRAMEWORK_BY_ID[fw]?.requirements.find((r) => r.code === code);
}

export interface Link {
  control: string;
  rel: Relationship;
  corroborated: boolean;
  match?: MatchStrength; // relative to the source requirement, when there is one
}

export interface Equivalent {
  framework: FrameworkId;
  code: string;
  title: string;
  via: string[]; // control ids linking the requirement
  links: Link[];
  match?: MatchStrength; // strongest correspondence to the source requirement
}

/** Map one requirement across all other frameworks via shared unified controls. */
export function equivalentsForRequirement(controls: ControlLike[], fw: FrameworkId, code: string) {
  const index = buildIndex(controls);
  const linked = index.get(key(fw, code)) ?? [];
  return { controls: linked, equivalents: equivalentsForControls(linked, fw, code) };
}

/** All requirements touched by a set of controls, grouped by framework. */
export function equivalentsForControls(linked: ControlLike[], sourceFw?: FrameworkId, sourceCode?: string) {
  const out = new Map<string, Equivalent>();
  for (const c of linked) {
    const srcRel = sourceFw && sourceCode ? relationship(c, sourceFw, sourceCode) : undefined;
    for (const [f, codes] of Object.entries(c.map) as [FrameworkId, string[]][]) {
      for (const code of codes) {
        if (f === sourceFw && code === sourceCode) continue;
        const rel = relationship(c, f, code);
        const link: Link = { control: c.id, rel, corroborated: !c.custom && isCorroborated(c.id, f, code), match: srcRel ? matchStrength(srcRel, rel) : undefined };
        const k = key(f, code);
        const existing = out.get(k);
        if (existing) {
          existing.via.push(c.id);
          existing.links.push(link);
        } else out.set(k, { framework: f, code, title: findRequirement(f, code)?.title ?? code, via: [c.id], links: [link] });
      }
    }
  }
  const grouped: Partial<Record<FrameworkId, Equivalent[]>> = {};
  for (const e of out.values()) {
    if (sourceFw) e.match = strongest(e.links.map((l) => l.match!));
    (grouped[e.framework] ??= []).push(e);
  }
  for (const fw of Object.keys(grouped) as FrameworkId[]) {
    const order = FRAMEWORK_BY_ID[fw].requirements.map((r) => r.code);
    grouped[fw]!.sort((a, b) => order.indexOf(a.code) - order.indexOf(b.code));
  }
  return grouped;
}

/** Crosswalk A -> B: for each requirement in A, the B requirements sharing a control. */
export function crosswalk(controls: ControlLike[], a: FrameworkId, b: FrameworkId) {
  const index = buildIndex(controls);
  const order = FRAMEWORK_BY_ID[b].requirements.map((r) => r.code);
  return FRAMEWORK_BY_ID[a].requirements.map((req) => {
    const linked = index.get(key(a, req.code)) ?? [];
    const targets = new Map<string, { via: string[]; matches: MatchStrength[] }>();
    for (const c of linked) {
      const ra = relationship(c, a, req.code);
      for (const code of c.map[b] ?? []) {
        const t = targets.get(code) ?? { via: [], matches: [] };
        t.via.push(c.id);
        t.matches.push(matchStrength(ra, relationship(c, b, code)));
        targets.set(code, t);
      }
    }
    return {
      requirement: req,
      controls: linked.map((c) => c.id),
      targets: [...targets.entries()]
        .sort((x, y) => order.indexOf(x[0]) - order.indexOf(y[0]))
        .map(([code, t]) => ({ code, title: findRequirement(b, code)?.title ?? code, via: t.via, match: strongest(t.matches) })),
    };
  });
}

/** Share of A's requirements that have a non-weak counterpart in B (via a shared control). */
export function overlap(controls: ControlLike[], a: FrameworkId, b: FrameworkId) {
  const rows = crosswalk(controls, a, b);
  const hit = rows.filter((r) => r.targets.some((t) => t.match !== "weak")).length;
  return rows.length ? hit / rows.length : 0;
}

/**
 * Requirement status from control status, honouring STRM:
 *  - met when any fully-covering (equal / subset_of) control is implemented, or when every
 *    required (non-supportive) mapped control is implemented;
 *  - supportive (intersects_with) controls never block a requirement.
 */
export function requirementStatus(linked: ControlLike[], status: Record<string, ControlStatus>, fw?: FrameworkId, code?: string): ReqStatus {
  const rel = (c: ControlLike) => (fw && code ? relationship(c, fw, code) : "superset_of");
  const live = linked.filter((c) => (status[c.id] ?? "not_started") !== "not_applicable");
  if (linked.length && live.length === 0) return "not_applicable";
  if (live.length === 0) return "gap";
  const st = (c: ControlLike) => status[c.id] ?? "not_started";
  if (live.some((c) => REL_META[rel(c)].full && st(c) === "implemented")) return "met";
  const required = live.filter((c) => rel(c) !== "intersects_with");
  const core = required.length ? required : live;
  if (core.every((c) => st(c) === "implemented")) return "met";
  if (live.some((c) => st(c) === "implemented" || st(c) === "in_progress")) return "partial";
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
    return { requirement, controls: linked, status: requirementStatus(linked, status, fw, requirement.code) };
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

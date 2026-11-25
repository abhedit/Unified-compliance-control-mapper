// Mapping integrity gate (runs in CI). Fails the build when the library violates the
// rules in MAPPING_METHODOLOGY.md §6.
import { FRAMEWORKS } from "../src/data/frameworks.ts";
import { CONTROLS, LIBRARY_VERSION } from "../src/data/controls.ts";
import { CORROBORATED, REFERENCE } from "../src/data/provenance.ts";
import { REL_META, buildIndex, key, relationship } from "../src/lib/mapper.ts";

const errors: string[] = [];
const RELS = Object.keys(REL_META);

// R1 unique control ids; R2 every control anchored to the reference metaframework
const ids = new Set<string>();
for (const c of CONTROLS) {
  if (ids.has(c.id)) errors.push(`R1 duplicate control id ${c.id}`);
  ids.add(c.id);
  if (!c.scf?.length) errors.push(`R2 ${c.id} has no SCF anchor`);
  if (!c.evidence.length) errors.push(`R2 ${c.id} has no evidence guidance`);
}

const index = buildIndex(CONTROLS);
for (const f of FRAMEWORKS) {
  const codes = new Set<string>();
  for (const r of f.requirements) {
    if (codes.has(r.code)) errors.push(`R3 ${f.id}: duplicate requirement ${r.code}`);
    codes.add(r.code);
  }
  for (const c of CONTROLS) {
    const mine = c.map[f.id] ?? [];
    if (new Set(mine).size !== mine.length) errors.push(`R4 ${c.id} -> ${f.id}: duplicate code`);
    // R4 every mapped code exists in the catalog
    for (const code of mine) if (!codes.has(code)) errors.push(`R4 ${c.id} -> ${f.id}:${code} is not in the ${f.shortName} catalog`);
  }
  // R5 every requirement is addressable: at least one non-supportive mapping
  let full = 0;
  for (const r of f.requirements) {
    const linked = index.get(key(f.id, r.code)) ?? [];
    const rels = linked.map((c) => relationship(c, f.id, r.code));
    if (!linked.length) errors.push(`R5 ${f.id}:${r.code} is not mapped to any control`);
    else if (rels.every((x) => x === "intersects_with")) errors.push(`R5 ${f.id}:${r.code} has only supportive (∩) mappings`);
    if (rels.some((x) => REL_META[x].full)) full++;
  }
  console.log(`${f.shortName.padEnd(12)} ${String(f.requirements.length).padStart(3)} requirements · ${full} fully covered by a single control`);
}

// R6 explicit relationships are valid and refer to existing links
for (const c of CONTROLS) for (const [k, v] of Object.entries(c.rel ?? {})) {
  const [fw, code] = [k.slice(0, k.indexOf(":")), k.slice(k.indexOf(":") + 1)];
  if (!RELS.includes(v)) errors.push(`R6 ${c.id} ${k}: invalid relationship ${v}`);
  if (!(c.map as Record<string, string[]>)[fw]?.includes(code)) errors.push(`R6 ${c.id} rel ${k} is not a mapped link`);
}

// R7 provenance refers to existing links
for (const p of CORROBORATED) {
  const [cid, fw, code] = p.split("|");
  const c = CONTROLS.find((x) => x.id === cid);
  if (!c || !(c.map as Record<string, string[]>)[fw]?.includes(code)) errors.push(`R7 stale provenance entry ${p} — re-run scripts/mapping-qa/reconcile.ts`);
}

const links = CONTROLS.reduce((n, c) => n + Object.values(c.map).reduce((m, v) => m + (v?.length ?? 0), 0), 0);
console.log(`Library v${LIBRARY_VERSION}: ${CONTROLS.length} controls, ${links} links, ${CORROBORATED.size} corroborated by ${REFERENCE.version}`);
if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`${errors.length} problem(s)`);
  process.exit(1);
}

// Validates the control library: every mapped code must exist in its framework,
// and reports framework requirements that no unified control covers.
import { FRAMEWORKS } from "../src/data/frameworks.ts";
import { CONTROLS } from "../src/data/controls.ts";

let errors = 0;
const ids = new Set<string>();
for (const c of CONTROLS) {
  if (ids.has(c.id)) { console.error(`Duplicate control id ${c.id}`); errors++; }
  ids.add(c.id);
}
for (const f of FRAMEWORKS) {
  const codes = new Set<string>();
  for (const r of f.requirements) {
    if (codes.has(r.code)) { console.error(`${f.id}: duplicate requirement ${r.code}`); errors++; }
    codes.add(r.code);
  }
  const covered = new Set<string>();
  for (const c of CONTROLS) {
    for (const code of c.map[f.id] ?? []) {
      if (!codes.has(code)) { console.error(`${c.id} -> ${f.id}:${code} does not exist`); errors++; }
      covered.add(code);
    }
  }
  const missing = f.requirements.filter((r) => !covered.has(r.code));
  console.log(`${f.shortName.padEnd(12)} ${covered.size}/${codes.size} requirements mapped` + (missing.length ? `  UNMAPPED: ${missing.map((m) => m.code).join(", ")}` : ""));
  errors += missing.length;
}
console.log(`${CONTROLS.length} unified controls`);
if (errors) { console.error(`${errors} problem(s)`); process.exit(1); }

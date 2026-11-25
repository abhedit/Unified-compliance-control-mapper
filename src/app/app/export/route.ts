import { getSession } from "@/lib/auth";
import { controlStates, enabledFrameworks, evidenceFor, orgControls } from "@/lib/org";
import { coverage, crosswalk } from "@/lib/mapper";
import { csvResponse } from "@/lib/csv";
import { FRAMEWORKS, FRAMEWORK_BY_ID, FRAMEWORK_IDS, type FrameworkId } from "@/data/frameworks";

export async function GET(req: Request) {
  const s = await getSession();
  if (!s) return new Response("Unauthorized", { status: 401 });
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const controls = orgControls(s.orgId);
  const states = controlStates(s.orgId);
  const status = Object.fromEntries(Object.values(states).map((x) => [x.control_id, x.status]));
  const fw = (k: string) => { const v = url.searchParams.get(k); return v && FRAMEWORK_IDS.includes(v as FrameworkId) ? (v as FrameworkId) : null; };

  if (type === "controls") {
    const fws = enabledFrameworks(s.orgId);
    const header = ["Control ID", "Name", "Domain", "Status", "Owner", "Description", ...FRAMEWORKS.filter((f) => fws.includes(f.id)).map((f) => f.shortName)];
    const rows = controls.map((c) => [c.id, c.name, c.domain, status[c.id] ?? "not_started", states[c.id]?.owner, c.description, ...FRAMEWORKS.filter((f) => fws.includes(f.id)).map((f) => (c.map[f.id] ?? []).join("; "))]);
    return csvResponse("unified-controls.csv", [header, ...rows]);
  }
  if (type === "soa") {
    const f = fw("fw");
    if (!f) return new Response("Bad framework", { status: 400 });
    const ev = evidenceFor(s.orgId);
    const cov = coverage(controls, f, status);
    const rows = cov.rows.map((r) => [
      r.requirement.code, r.requirement.title, r.requirement.group, r.status,
      r.controls.map((c) => c.id).join("; "), r.controls.map((c) => `${c.id}: ${status[c.id] ?? "not_started"}`).join("; "),
      r.controls.map((c) => states[c.id]?.owner).filter(Boolean).join("; "),
      ev.filter((e) => r.controls.some((c) => c.id === e.control_id)).map((e) => e.url ? `${e.title} (${e.url})` : e.title).join("; "),
      r.controls.map((c) => states[c.id]?.notes).filter(Boolean).join(" | "),
    ]);
    return csvResponse(`${f}-soa-gap-report.csv`, [["Ref", "Requirement", "Group", "Requirement status", "Unified controls", "Control status", "Owners", "Evidence", "Implementation notes"], ...rows]);
  }
  if (type === "crosswalk") {
    const a = fw("a"), b = fw("b");
    if (!a || !b) return new Response("Bad framework", { status: 400 });
    const rows = crosswalk(controls, a, b).map((r) => [r.requirement.code, r.requirement.title, r.targets.map((t) => t.code).join("; "), r.targets.map((t) => t.title).join("; "), r.controls.join("; ")]);
    return csvResponse(`crosswalk-${a}-to-${b}.csv`, [[`${FRAMEWORK_BY_ID[a].shortName} ref`, "Requirement", `${FRAMEWORK_BY_ID[b].shortName} refs`, "Titles", "Unified controls"], ...rows]);
  }
  return new Response("Unknown export type", { status: 400 });
}

import { enabledFrameworks, orgControls, orgFromApiKey, statusMap } from "@/lib/org";
import { coverage } from "@/lib/mapper";
import { asFramework, privateJson } from "@/lib/api";

// GET /api/v1/workspace/coverage[?framework=soc2]   Authorization: Bearer ucm_live_...
export function GET(req: Request) {
  const orgId = orgFromApiKey(req.headers.get("authorization"));
  if (!orgId) return privateJson({ error: "unauthorized" }, 401);
  const controls = orgControls(orgId);
  const status = statusMap(orgId);
  const fw = asFramework(new URL(req.url).searchParams.get("framework"));
  const fws = fw ? [fw] : enabledFrameworks(orgId);
  return privateJson({
    data: fws.map((f) => {
      const c = coverage(controls, f, status);
      return {
        framework: f, percent: c.percent, met: c.met, partial: c.partial, gap: c.gap, total: c.total,
        requirements: c.rows.map((r) => ({ code: r.requirement.code, title: r.requirement.title, status: r.status, controls: r.controls.map((x) => x.id) })),
      };
    }),
  });
}

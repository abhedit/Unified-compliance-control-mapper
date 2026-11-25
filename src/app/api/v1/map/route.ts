import { CONTROLS, CONTROL_BY_ID } from "@/data/controls";
import { equivalentsForControls, equivalentsForRequirement, findRequirement } from "@/lib/mapper";
import { asFramework, json } from "@/lib/api";

// GET /api/v1/map?framework=iso27001&code=A.8.5   or   /api/v1/map?control=IAM-04
export function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const controlId = sp.get("control");
  if (controlId) {
    const c = CONTROL_BY_ID[controlId];
    if (!c) return json({ error: "control_not_found" }, 404);
    return json({ control: c, mappings: equivalentsForControls([c]) });
  }
  const fw = asFramework(sp.get("framework"));
  const code = sp.get("code");
  if (!fw || !code) return json({ error: "framework and code (or control) query parameters are required" }, 400);
  const requirement = findRequirement(fw, code);
  if (!requirement) return json({ error: "requirement_not_found" }, 404);
  const { controls, equivalents } = equivalentsForRequirement(CONTROLS, fw, code);
  return json({ source: { framework: fw, ...requirement }, controls: controls.map((c) => ({ id: c.id, name: c.name, domain: c.domain })), equivalents });
}

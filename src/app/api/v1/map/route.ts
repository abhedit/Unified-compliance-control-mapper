import { CONTROLS, CONTROL_BY_ID, LIBRARY_VERSION } from "@/data/controls";
import { relationship } from "@/lib/mapper";
import { equivalentsForControls, equivalentsForRequirement, findRequirement } from "@/lib/mapper";
import { asFramework, json } from "@/lib/api";

// GET /api/v1/map?framework=iso27001&code=A.8.5   or   /api/v1/map?control=IAM-04
export function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const controlId = sp.get("control");
  if (controlId) {
    const c = CONTROL_BY_ID[controlId];
    if (!c) return json({ error: "control_not_found" }, 404);
    return json({ library_version: LIBRARY_VERSION, control: { id: c.id, name: c.name, domain: c.domain, description: c.description, scf_anchors: c.scf }, mappings: equivalentsForControls([c]) });
  }
  const fw = asFramework(sp.get("framework"));
  const code = sp.get("code");
  if (!fw || !code) return json({ error: "framework and code (or control) query parameters are required" }, 400);
  const requirement = findRequirement(fw, code);
  if (!requirement) return json({ error: "requirement_not_found" }, 404);
  const { controls, equivalents } = equivalentsForRequirement(CONTROLS, fw, code);
  return json({ source: { framework: fw, ...requirement }, library_version: LIBRARY_VERSION, controls: controls.map((c) => ({ id: c.id, name: c.name, domain: c.domain, relationship: relationship(c, fw, code) })), equivalents });
}

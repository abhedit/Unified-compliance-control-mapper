import { controlStates, orgControls, orgFromApiKey } from "@/lib/org";
import { privateJson } from "@/lib/api";
import { mappingsOf } from "@/lib/serialize";

export function GET(req: Request) {
  const orgId = orgFromApiKey(req.headers.get("authorization"));
  if (!orgId) return privateJson({ error: "unauthorized" }, 401);
  const states = controlStates(orgId);
  return privateJson({
    data: orgControls(orgId).map((c) => ({
      id: c.id, name: c.name, domain: c.domain, description: c.description, custom: !!c.custom, mappings: mappingsOf(c), status: states[c.id]?.status ?? "not_started", owner: states[c.id]?.owner ?? null, updated_at: states[c.id]?.updated_at ?? null,
    })),
  });
}

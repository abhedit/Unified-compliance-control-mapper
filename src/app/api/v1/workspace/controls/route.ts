import { controlStates, orgControls, orgFromApiKey } from "@/lib/org";
import { privateJson } from "@/lib/api";

export function GET(req: Request) {
  const orgId = orgFromApiKey(req.headers.get("authorization"));
  if (!orgId) return privateJson({ error: "unauthorized" }, 401);
  const states = controlStates(orgId);
  return privateJson({
    data: orgControls(orgId).map((c) => ({
      ...c, custom: !!c.custom, status: states[c.id]?.status ?? "not_started", owner: states[c.id]?.owner ?? null, updated_at: states[c.id]?.updated_at ?? null,
    })),
  });
}

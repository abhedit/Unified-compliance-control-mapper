import "server-only";
import { requireSession } from "./auth";
import { controlStates, enabledFrameworks, orgControls } from "./org";
import type { ControlLike, ControlStatus } from "./mapper";
import type { FrameworkId } from "@/data/frameworks";

/** Loads everything most app pages need for the signed-in workspace. */
export async function loadWorkspace() {
  const session = await requireSession();
  const frameworks = enabledFrameworks(session.orgId);
  const controls = orgControls(session.orgId);
  const states = controlStates(session.orgId);
  const status: Record<string, ControlStatus> = Object.fromEntries(Object.values(states).map((s) => [s.control_id, s.status]));
  const inScope = (c: ControlLike, fws: FrameworkId[] = frameworks) => fws.some((f) => (c.map[f]?.length ?? 0) > 0);
  return { session, frameworks, controls, states, status, inScope };
}

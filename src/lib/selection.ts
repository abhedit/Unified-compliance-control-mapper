import { FRAMEWORK_IDS, type FrameworkId } from "@/data/frameworks";

export type Selection = { kind: "req"; fw: FrameworkId; code: string } | { kind: "control"; id: string } | null;

export function parseSelection(sp: Record<string, string | undefined>): Selection {
  if (sp.control) return { kind: "control", id: sp.control };
  if (sp.fw && sp.code && FRAMEWORK_IDS.includes(sp.fw as FrameworkId)) return { kind: "req", fw: sp.fw as FrameworkId, code: sp.code };
  return null;
}

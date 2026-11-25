import { isCorroborated, relationship, type ControlLike } from "./mapper";
import type { FrameworkId } from "@/data/frameworks";

/** Flatten a control's mappings with STRM relationship and provenance for API/export consumers. */
export function mappingsOf(c: ControlLike) {
  return (Object.entries(c.map) as [FrameworkId, string[]][]).flatMap(([framework, codes]) =>
    codes.map((code) => ({
      framework,
      code,
      relationship: relationship(c, framework, code),
      provenance: c.custom ? "customer" : isCorroborated(c.id, framework, code) ? "scf_corroborated" : "analyst_asserted",
    })),
  );
}

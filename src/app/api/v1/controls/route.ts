import { CONTROLS, LIBRARY_VERSION } from "@/data/controls";
import { REFERENCE } from "@/data/provenance";
import { asFramework, json } from "@/lib/api";
import { mappingsOf } from "@/lib/serialize";

export function GET(req: Request) {
  const fw = asFramework(new URL(req.url).searchParams.get("framework"));
  const list = fw ? CONTROLS.filter((c) => c.map[fw]?.length) : CONTROLS;
  return json({
    library_version: LIBRARY_VERSION,
    reference: REFERENCE,
    methodology: "NIST IR 8477 set-theory relationship mapping; see /methodology",
    data: list.map(({ map: _map, rel: _rel, ...c }) => ({ ...c, mappings: mappingsOf(CONTROLS.find((x) => x.id === c.id)!).filter((m) => !fw || m.framework === fw) })),
  });
}

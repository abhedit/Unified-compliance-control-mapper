import { CONTROLS } from "@/data/controls";
import { asFramework, json } from "@/lib/api";

export function GET(req: Request) {
  const fw = asFramework(new URL(req.url).searchParams.get("framework"));
  return json({ data: fw ? CONTROLS.filter((c) => c.map[fw]?.length) : CONTROLS });
}

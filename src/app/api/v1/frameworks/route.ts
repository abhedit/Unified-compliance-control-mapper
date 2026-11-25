import { FRAMEWORKS } from "@/data/frameworks";
import { json } from "@/lib/api";

export function GET(req: Request) {
  const full = new URL(req.url).searchParams.get("include") === "requirements";
  return json({
    data: FRAMEWORKS.map(({ requirements, ...f }) => ({ ...f, requirement_count: requirements.length, ...(full ? { requirements } : {}) })),
  });
}

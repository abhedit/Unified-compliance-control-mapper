import { FRAMEWORK_IDS, type FrameworkId } from "@/data/frameworks";

export const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "access-control-allow-origin": "*", "cache-control": status === 200 ? "public, max-age=300" : "no-store" } });

export const privateJson = (data: unknown, status = 200) => Response.json(data, { status, headers: { "cache-control": "no-store" } });

export const asFramework = (v: string | null): FrameworkId | null => (v && FRAMEWORK_IDS.includes(v as FrameworkId) ? (v as FrameworkId) : null);

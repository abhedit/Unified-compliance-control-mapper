import "server-only";
import { randomBytes } from "node:crypto";
import { db, newId, now } from "./db";
import { sha256 } from "./auth";
import { CONTROLS } from "@/data/controls";
import { FRAMEWORK_IDS, type FrameworkId } from "@/data/frameworks";
import type { ControlLike, ControlStatus } from "./mapper";

export const STATUSES: ControlStatus[] = ["not_started", "in_progress", "implemented", "not_applicable"];

export interface ControlState {
  control_id: string;
  status: ControlStatus;
  owner: string | null;
  notes: string | null;
  updated_at: number;
  updated_by: string | null;
}

export function enabledFrameworks(orgId: string): FrameworkId[] {
  const rows = db().prepare("SELECT framework_id FROM org_frameworks WHERE org_id = ?").all(orgId) as { framework_id: string }[];
  const set = new Set(rows.map((r) => r.framework_id));
  return FRAMEWORK_IDS.filter((f) => set.has(f));
}

export function setEnabledFrameworks(orgId: string, ids: string[]) {
  const valid = ids.filter((i): i is FrameworkId => FRAMEWORK_IDS.includes(i as FrameworkId));
  const conn = db();
  conn.exec("BEGIN");
  conn.prepare("DELETE FROM org_frameworks WHERE org_id = ?").run(orgId);
  const ins = conn.prepare("INSERT INTO org_frameworks (org_id, framework_id) VALUES (?, ?)");
  for (const v of valid) ins.run(orgId, v);
  conn.exec("COMMIT");
}

export function customControls(orgId: string): ControlLike[] {
  const rows = db()
    .prepare("SELECT id, name, domain, description, map_json FROM custom_controls WHERE org_id = ? ORDER BY created_at")
    .all(orgId) as { id: string; name: string; domain: string; description: string; map_json: string }[];
  return rows.map((r) => ({ id: r.id, name: r.name, domain: r.domain, description: r.description, map: JSON.parse(r.map_json), custom: true }));
}

/** Library + this org's custom controls. */
export function orgControls(orgId: string): ControlLike[] {
  return [...CONTROLS, ...customControls(orgId)];
}

export function createCustomControl(orgId: string, input: { name: string; domain: string; description: string; map: ControlLike["map"] }) {
  const existing = db().prepare("SELECT id FROM custom_controls WHERE org_id = ?").all(orgId) as { id: string }[];
  const next = Math.max(0, ...existing.map((r) => Number(r.id.replace(/\D/g, "")) || 0)) + 1;
  const id = `CUS-${String(next).padStart(2, "0")}`;
  db()
    .prepare("INSERT INTO custom_controls (id, org_id, name, domain, description, map_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(id, orgId, input.name, input.domain, input.description, JSON.stringify(input.map), now());
  return id;
}

export function deleteCustomControl(orgId: string, id: string) {
  db().prepare("DELETE FROM custom_controls WHERE org_id = ? AND id = ?").run(orgId, id);
  db().prepare("DELETE FROM control_state WHERE org_id = ? AND control_id = ?").run(orgId, id);
}

export function controlStates(orgId: string): Record<string, ControlState> {
  const rows = db().prepare("SELECT * FROM control_state WHERE org_id = ?").all(orgId) as unknown as ControlState[];
  return Object.fromEntries(rows.map((r) => [r.control_id, r]));
}

export function statusMap(orgId: string): Record<string, ControlStatus> {
  return Object.fromEntries(Object.values(controlStates(orgId)).map((s) => [s.control_id, s.status]));
}

export function upsertControlState(
  orgId: string,
  controlId: string,
  patch: { status: ControlStatus; owner: string; notes: string },
  by: string,
) {
  db()
    .prepare(
      `INSERT INTO control_state (org_id, control_id, status, owner, notes, updated_at, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(org_id, control_id) DO UPDATE SET status = excluded.status, owner = excluded.owner,
         notes = excluded.notes, updated_at = excluded.updated_at, updated_by = excluded.updated_by`,
    )
    .run(orgId, controlId, patch.status, patch.owner || null, patch.notes || null, now(), by);
}

export interface Evidence { id: string; control_id: string; title: string; url: string | null; created_at: number; added_by: string | null }

export function evidenceFor(orgId: string, controlId?: string): Evidence[] {
  const sql = controlId
    ? "SELECT * FROM evidence WHERE org_id = ? AND control_id = ? ORDER BY created_at DESC"
    : "SELECT * FROM evidence WHERE org_id = ? ORDER BY created_at DESC";
  const args = controlId ? [orgId, controlId] : [orgId];
  return db().prepare(sql).all(...args) as unknown as Evidence[];
}

export function addEvidence(orgId: string, controlId: string, title: string, url: string, by: string) {
  db()
    .prepare("INSERT INTO evidence (id, org_id, control_id, title, url, created_at, added_by) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(newId("evd"), orgId, controlId, title, url || null, now(), by);
}

export function deleteEvidence(orgId: string, id: string) {
  db().prepare("DELETE FROM evidence WHERE org_id = ? AND id = ?").run(orgId, id);
}

export function logActivity(orgId: string, userName: string, action: string, detail: string) {
  db()
    .prepare("INSERT INTO activity (org_id, user_name, action, detail, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(orgId, userName, action, detail, now());
}

export function recentActivity(orgId: string, limit = 12) {
  return db()
    .prepare("SELECT user_name, action, detail, created_at FROM activity WHERE org_id = ? ORDER BY created_at DESC, id DESC LIMIT ?")
    .all(orgId, limit) as { user_name: string; action: string; detail: string; created_at: number }[];
}

// ─────────── API keys ───────────

export function createApiKey(orgId: string, name: string) {
  const secret = `ucm_live_${randomBytes(24).toString("base64url")}`;
  db()
    .prepare("INSERT INTO api_keys (id, org_id, name, prefix, key_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(newId("key"), orgId, name, secret.slice(0, 14), sha256(secret), now());
  return secret;
}

export function listApiKeys(orgId: string) {
  return db()
    .prepare("SELECT id, name, prefix, created_at, last_used_at FROM api_keys WHERE org_id = ? ORDER BY created_at DESC")
    .all(orgId) as { id: string; name: string; prefix: string; created_at: number; last_used_at: number | null }[];
}

export function revokeApiKey(orgId: string, id: string) {
  db().prepare("DELETE FROM api_keys WHERE org_id = ? AND id = ?").run(orgId, id);
}

export function orgFromApiKey(header: string | null): string | null {
  const token = header?.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const row = db().prepare("SELECT id, org_id FROM api_keys WHERE key_hash = ?").get(sha256(token)) as { id: string; org_id: string } | undefined;
  if (!row) return null;
  db().prepare("UPDATE api_keys SET last_used_at = ? WHERE id = ?").run(now(), row.id);
  return row.org_id;
}

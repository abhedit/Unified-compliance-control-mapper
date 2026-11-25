import "server-only";
import path from "node:path";
import fs from "node:fs";
import type { DatabaseSync as DatabaseSyncType } from "node:sqlite";

// node:sqlite is loaded through getBuiltinModule so bundlers never try to resolve it.
const { DatabaseSync } = process.getBuiltinModule("node:sqlite") as typeof import("node:sqlite");

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
  password_hash TEXT NOT NULL, created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS orgs (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, plan TEXT NOT NULL DEFAULT 'starter', created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS memberships (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin', PRIMARY KEY (user_id, org_id)
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS org_frameworks (
  org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE, framework_id TEXT NOT NULL,
  PRIMARY KEY (org_id, framework_id)
);
CREATE TABLE IF NOT EXISTS control_state (
  org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE, control_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started', owner TEXT, notes TEXT,
  updated_at INTEGER NOT NULL, updated_by TEXT, PRIMARY KEY (org_id, control_id)
);
CREATE TABLE IF NOT EXISTS evidence (
  id TEXT PRIMARY KEY, org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  control_id TEXT NOT NULL, title TEXT NOT NULL, url TEXT, created_at INTEGER NOT NULL, added_by TEXT
);
CREATE TABLE IF NOT EXISTS custom_controls (
  id TEXT NOT NULL, org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL, domain TEXT NOT NULL, description TEXT NOT NULL, map_json TEXT NOT NULL,
  created_at INTEGER NOT NULL, PRIMARY KEY (org_id, id)
);
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY, org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL, prefix TEXT NOT NULL, key_hash TEXT UNIQUE NOT NULL,
  created_at INTEGER NOT NULL, last_used_at INTEGER
);
CREATE TABLE IF NOT EXISTS activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT, org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_name TEXT, action TEXT NOT NULL, detail TEXT, created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS org_profile (
  org_id TEXT PRIMARY KEY REFERENCES orgs(id) ON DELETE CASCADE, profile_json TEXT NOT NULL, updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_activity_org ON activity(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_evidence_org ON evidence(org_id, control_id);
`;

declare global {
  // eslint-disable-next-line no-var
  var __ucmDb: DatabaseSyncType | undefined;
}

export function db(): DatabaseSyncType {
  if (!globalThis.__ucmDb) {
    const file = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "ucm.db");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const conn = new DatabaseSync(file);
    conn.exec(SCHEMA);
    globalThis.__ucmDb = conn;
  }
  return globalThis.__ucmDb;
}

export const now = () => Date.now();
export const newId = (prefix: string) => `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;

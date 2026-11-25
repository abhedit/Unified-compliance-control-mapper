import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { db, newId, now } from "./db";

const COOKIE = "ucm_session";
const SESSION_DAYS = 14;

export function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string) {
  const [, saltHex, hashHex] = stored.split("$");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(expected, actual);
}

export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export interface SessionUser {
  userId: string;
  name: string;
  email: string;
  orgId: string;
  orgName: string;
  plan: string;
  role: string;
}

export async function createSession(userId: string, orgId: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = now() + SESSION_DAYS * 86400_000;
  db()
    .prepare("INSERT INTO sessions (token_hash, user_id, org_id, expires_at) VALUES (?, ?, ?, ?)")
    .run(sha256(token), userId, orgId, expires);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
    path: "/",
    expires: new Date(expires),
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) db().prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha256(token));
  jar.set(COOKIE, "", { path: "/", maxAge: 0 });
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const row = db()
    .prepare(
      `SELECT s.user_id, s.org_id, s.expires_at, u.name, u.email, o.name AS org_name, o.plan, m.role
       FROM sessions s JOIN users u ON u.id = s.user_id JOIN orgs o ON o.id = s.org_id
       JOIN memberships m ON m.user_id = s.user_id AND m.org_id = s.org_id
       WHERE s.token_hash = ?`,
    )
    .get(sha256(token)) as Record<string, string | number> | undefined;
  if (!row || Number(row.expires_at) < now()) return null;
  return {
    userId: String(row.user_id),
    name: String(row.name),
    email: String(row.email),
    orgId: String(row.org_id),
    orgName: String(row.org_name),
    plan: String(row.plan),
    role: String(row.role),
  };
}

export async function requireSession() {
  const s = await getSession();
  if (!s) redirect("/login");
  return s;
}

export function registerUser(input: { name: string; email: string; password: string; company: string; frameworks: string[] }) {
  const email = input.email.trim().toLowerCase();
  if (db().prepare("SELECT 1 FROM users WHERE email = ?").get(email)) {
    throw new Error("An account with this email already exists.");
  }
  const userId = newId("usr");
  const orgId = newId("org");
  const t = now();
  const conn = db();
  conn.exec("BEGIN");
  try {
    conn
      .prepare("INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)")
      .run(userId, email, input.name.trim(), hashPassword(input.password), t);
    conn.prepare("INSERT INTO orgs (id, name, plan, created_at) VALUES (?, ?, 'trial', ?)").run(orgId, input.company.trim(), t);
    conn.prepare("INSERT INTO memberships (user_id, org_id, role) VALUES (?, ?, 'owner')").run(userId, orgId);
    const ins = conn.prepare("INSERT INTO org_frameworks (org_id, framework_id) VALUES (?, ?)");
    for (const fw of input.frameworks) ins.run(orgId, fw);
    conn
      .prepare("INSERT INTO activity (org_id, user_name, action, detail, created_at) VALUES (?, ?, 'workspace.created', ?, ?)")
      .run(orgId, input.name.trim(), input.company.trim(), t);
    conn.exec("COMMIT");
  } catch (e) {
    conn.exec("ROLLBACK");
    throw e;
  }
  return { userId, orgId };
}

export function authenticate(email: string, password: string) {
  const row = db()
    .prepare(
      `SELECT u.id, u.password_hash, m.org_id FROM users u JOIN memberships m ON m.user_id = u.id
       WHERE u.email = ? ORDER BY m.rowid LIMIT 1`,
    )
    .get(email.trim().toLowerCase()) as { id: string; password_hash: string; org_id: string } | undefined;
  if (!row || !verifyPassword(password, row.password_hash)) return null;
  return { userId: row.id, orgId: row.org_id };
}

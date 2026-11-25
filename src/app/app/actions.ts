"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import {
  STATUSES, addEvidence, controlStates, createApiKey, createCustomControl, deleteCustomControl, deleteEvidence,
  logActivity, orgControls, revokeApiKey, saveProfile, setEnabledFrameworks, upsertControlState,
} from "@/lib/org";
import { similarControls, suggestMappings, type ControlStatus } from "@/lib/mapper";
import { CONTROLS } from "@/data/controls";
import { FRAMEWORK_IDS, type FrameworkId } from "@/data/frameworks";
import { DEFAULT_PROFILE, type CompanyProfile } from "@/lib/applicability";

function assertControl(orgId: string, id: string) {
  if (!orgControls(orgId).some((c) => c.id === id)) throw new Error("Unknown control");
}

export async function updateControlAction(form: FormData) {
  const s = await requireSession();
  const id = String(form.get("controlId"));
  assertControl(s.orgId, id);
  const status = String(form.get("status")) as ControlStatus;
  if (!STATUSES.includes(status)) throw new Error("Invalid status");
  const notes = String(form.get("notes") ?? "").trim().slice(0, 4000);
  // ISO/IEC 27001 6.1.3(d): exclusions in the Statement of Applicability must be justified.
  if (status === "not_applicable" && notes.length < 10) redirect(`/app/controls/${id}?error=justification`);
  upsertControlState(s.orgId, id, { status, owner: String(form.get("owner") ?? "").slice(0, 120), notes }, s.name);
  logActivity(s.orgId, s.name, "control.updated", `${id} → ${status}`);
  revalidatePath("/app", "layout");
}

export async function quickStatusAction(controlId: string, status: ControlStatus) {
  const s = await requireSession();
  assertControl(s.orgId, controlId);
  if (!STATUSES.includes(status)) throw new Error("Invalid status");
  const prev = controlStates(s.orgId)[controlId];
  if (status === "not_applicable" && (prev?.notes ?? "").trim().length < 10) throw new Error("A justification is required to mark a control Not applicable.");
  upsertControlState(s.orgId, controlId, { status, owner: prev?.owner ?? "", notes: prev?.notes ?? "" }, s.name);
  logActivity(s.orgId, s.name, "control.updated", `${controlId} → ${status}`);
  revalidatePath("/app", "layout");
}

export async function addEvidenceAction(form: FormData) {
  const s = await requireSession();
  const id = String(form.get("controlId"));
  assertControl(s.orgId, id);
  const title = String(form.get("title") ?? "").trim().slice(0, 200);
  const url = String(form.get("url") ?? "").trim().slice(0, 1000);
  if (!title) return;
  if (url && !/^https?:\/\//i.test(url)) throw new Error("Evidence links must be http(s) URLs");
  addEvidence(s.orgId, id, title, url, s.name);
  logActivity(s.orgId, s.name, "evidence.added", `${id}: ${title}`);
  revalidatePath(`/app/controls/${id}`);
}

export async function deleteEvidenceAction(form: FormData) {
  const s = await requireSession();
  deleteEvidence(s.orgId, String(form.get("id")));
  revalidatePath(`/app/controls/${String(form.get("controlId"))}`);
}

export async function saveFrameworksAction(form: FormData) {
  const s = await requireSession();
  const ids = form.getAll("frameworks").map(String);
  setEnabledFrameworks(s.orgId, ids);
  logActivity(s.orgId, s.name, "frameworks.updated", ids.join(", "));
  revalidatePath("/app", "layout");
}

export async function applyScopeAction(profile: CompanyProfile, frameworks: FrameworkId[]) {
  const s = await requireSession();
  const clean = Object.fromEntries(Object.entries(DEFAULT_PROFILE).map(([k, v]) => [k, k in profile ? (profile as unknown as Record<string, unknown>)[k] : v]));
  saveProfile(s.orgId, clean);
  setEnabledFrameworks(s.orgId, frameworks);
  logActivity(s.orgId, s.name, "scope.applied", `${frameworks.length} frameworks from applicability assessment`);
  revalidatePath("/app", "layout");
}

export async function suggestAction(text: string) {
  await requireSession();
  const clean = text.slice(0, 3000);
  return { suggestions: suggestMappings(CONTROLS, clean), similar: similarControls(CONTROLS, clean) };
}

export async function createCustomControlAction(input: { name: string; domain: string; description: string; map: Record<string, string[]> }) {
  const s = await requireSession();
  if (!input.name.trim() || !input.description.trim()) return { error: "Name and description are required." };
  const map: Partial<Record<FrameworkId, string[]>> = {};
  for (const [fw, codes] of Object.entries(input.map)) {
    if (FRAMEWORK_IDS.includes(fw as FrameworkId) && codes.length) map[fw as FrameworkId] = [...new Set(codes.map(String))].slice(0, 50);
  }
  const id = createCustomControl(s.orgId, { name: input.name.trim().slice(0, 160), domain: input.domain.slice(0, 60) || "Custom", description: input.description.trim().slice(0, 3000), map });
  logActivity(s.orgId, s.name, "custom_control.created", `${id}: ${input.name}`);
  revalidatePath("/app", "layout");
  return { id };
}

export async function deleteCustomControlAction(form: FormData) {
  const s = await requireSession();
  const id = String(form.get("id"));
  deleteCustomControl(s.orgId, id);
  logActivity(s.orgId, s.name, "custom_control.deleted", id);
  revalidatePath("/app", "layout");
  redirect("/app/custom");
}

export async function createApiKeyAction(_: { secret?: string }, form: FormData): Promise<{ secret?: string }> {
  const s = await requireSession();
  const name = String(form.get("name") ?? "").trim() || "API key";
  const secret = createApiKey(s.orgId, name.slice(0, 80));
  logActivity(s.orgId, s.name, "api_key.created", name);
  revalidatePath("/app/settings");
  return { secret } as { secret?: string };
}

export async function revokeApiKeyAction(form: FormData) {
  const s = await requireSession();
  revokeApiKey(s.orgId, String(form.get("id")));
  logActivity(s.orgId, s.name, "api_key.revoked", String(form.get("id")));
  revalidatePath("/app/settings");
}

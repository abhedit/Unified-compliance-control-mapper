"use server";

import { redirect } from "next/navigation";
import { authenticate, createSession, destroySession, registerUser } from "@/lib/auth";
import { FRAMEWORK_IDS } from "@/data/frameworks";

export interface FormState { error?: string }

export async function signupAction(_: FormState, form: FormData): Promise<FormState> {
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const company = String(form.get("company") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const frameworks = form.getAll("frameworks").map(String).filter((f) => FRAMEWORK_IDS.includes(f as never));
  if (!name || !company) return { error: "Name and company are required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid work email." };
  if (password.length < 10) return { error: "Password must be at least 10 characters." };
  let ids;
  try {
    ids = registerUser({ name, email, company, password, frameworks: frameworks.length ? frameworks : ["iso27001", "soc2"] });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not create account." };
  }
  await createSession(ids.userId, ids.orgId);
  redirect("/app");
}

export async function loginAction(_: FormState, form: FormData): Promise<FormState> {
  const res = authenticate(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
  if (!res) return { error: "Invalid email or password." };
  await createSession(res.userId, res.orgId);
  redirect("/app");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, signupAction, type FormState } from "@/app/auth-actions";
import { FRAMEWORKS } from "@/data/frameworks";

function ErrorBox({ state }: { state: FormState }) {
  return state.error ? <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</div> : null;
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});
  return (
    <form action={action} className="space-y-4">
      <ErrorBox state={state} />
      <div>
        <label className="label" htmlFor="email">Work email</label>
        <input id="email" name="email" type="email" required className="input" autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required className="input" autoComplete="current-password" />
      </div>
      <button className="btn-primary w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      <p className="text-center text-sm text-slate-500">
        New to Abhedit Control Mapper? <Link href="/signup" className="font-semibold text-brand-700">Create a workspace</Link>
      </p>
    </form>
  );
}

export function SignupForm({ preselect }: { preselect?: string[] }) {
  const [state, action, pending] = useActionState(signupAction, {});
  return (
    <form action={action} className="space-y-4">
      <ErrorBox state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Your name</label>
          <input id="name" name="name" required className="input" autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="company">Company</label>
          <input id="company" name="company" required className="input" autoComplete="organization" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="email">Work email</label>
        <input id="email" name="email" type="email" required className="input" autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required minLength={10} className="input" autoComplete="new-password" />
        <p className="mt-1 text-xs text-slate-500">At least 10 characters.</p>
      </div>
      <fieldset>
        <legend className="label">Which frameworks are you working towards? <a href="/assess" className="font-normal text-brand-700 hover:underline">Not sure? Check what applies →</a></legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FRAMEWORKS.map((f) => (
            <label key={f.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm hover:bg-slate-50">
              <input type="checkbox" name="frameworks" value={f.id} defaultChecked={preselect ? preselect.includes(f.id) : f.id === "iso27001" || f.id === "soc2"} />
              {f.shortName}
            </label>
          ))}
        </div>
      </fieldset>
      <button className="btn-primary w-full" disabled={pending}>{pending ? "Creating workspace…" : "Create workspace"}</button>
      <p className="text-center text-sm text-slate-500">
        Already have an account? <Link href="/login" className="font-semibold text-brand-700">Sign in</Link>
      </p>
    </form>
  );
}

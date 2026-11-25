"use client";

import { useActionState } from "react";
import { createApiKeyAction } from "@/app/app/actions";

export default function ApiKeyForm() {
  const [state, action, pending] = useActionState(createApiKeyAction, {});
  return (
    <div>
      <form action={action} className="flex gap-2">
        <input name="name" placeholder="Key name, e.g. Data warehouse sync" className="input" />
        <button className="btn-primary shrink-0" disabled={pending}>Create key</button>
      </form>
      {state.secret && (
        <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
          Copy this key now — it won&apos;t be shown again:
          <code className="mt-1 block rounded bg-white px-2 py-1 font-mono text-xs break-all select-all">{state.secret}</code>
        </div>
      )}
    </div>
  );
}

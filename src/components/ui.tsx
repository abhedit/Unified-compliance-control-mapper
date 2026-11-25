import Link from "next/link";
import type { ReactNode } from "react";
import { FRAMEWORK_BY_ID, type FrameworkId } from "@/data/frameworks";
import type { ControlStatus, ReqStatus } from "@/lib/mapper";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 max-w-3xl text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function FrameworkBadge({ id, code, href }: { id: FrameworkId; code?: string; href?: string }) {
  const f = FRAMEWORK_BY_ID[id];
  const inner = (
    <span
      className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium whitespace-nowrap"
      style={{ borderColor: `${f.color}40`, background: `${f.color}12`, color: f.color }}
    >
      {code ? (
        <>
          <span className="opacity-70">{f.shortName}</span>
          <span className="font-semibold">{code}</span>
        </>
      ) : (
        f.shortName
      )}
    </span>
  );
  return href ? (
    <Link href={href} className="hover:opacity-80">
      {inner}
    </Link>
  ) : (
    inner
  );
}

const CONTROL_STATUS: Record<ControlStatus, [string, string]> = {
  not_started: ["Not started", "bg-slate-100 text-slate-600"],
  in_progress: ["In progress", "bg-amber-100 text-amber-800"],
  implemented: ["Implemented", "bg-emerald-100 text-emerald-800"],
  not_applicable: ["Not applicable", "bg-slate-100 text-slate-400 line-through"],
};

export const statusLabel = (s: ControlStatus) => CONTROL_STATUS[s][0];

export function StatusBadge({ status }: { status: ControlStatus }) {
  const [label, cls] = CONTROL_STATUS[status];
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${cls}`}>{label}</span>;
}

const REQ_STATUS: Record<ReqStatus, [string, string]> = {
  met: ["Met", "bg-emerald-100 text-emerald-800"],
  partial: ["Partial", "bg-amber-100 text-amber-800"],
  gap: ["Gap", "bg-rose-100 text-rose-700"],
  not_applicable: ["N/A", "bg-slate-100 text-slate-500"],
};

export function ReqStatusBadge({ status }: { status: ReqStatus }) {
  const [label, cls] = REQ_STATUS[status];
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}

export function Progress({ value, color = "#4f46e5", className = "" }: { value: number; color?: string; className?: string }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-100 ${className}`}>
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="card p-4">
      <div className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <rect width="32" height="32" rx="8" fill="#4f46e5" />
        <circle cx="10" cy="11" r="3" fill="#fff" />
        <circle cx="22" cy="11" r="3" fill="#c7d2fe" />
        <circle cx="10" cy="22" r="3" fill="#c7d2fe" />
        <circle cx="22" cy="22" r="3" fill="#fff" />
        <path d="M10 11 L22 22 M22 11 L10 22" stroke="#fff" strokeWidth="1.6" />
      </svg>
      <span>
        abhedit<span className="text-brand-600"> UCM</span>
      </span>
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">{children}</div>;
}

export function fmtDate(ms: number | null | undefined) {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

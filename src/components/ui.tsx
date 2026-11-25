import Link from "next/link";
import type { ReactNode } from "react";
import { FRAMEWORK_BY_ID, type FrameworkId } from "@/data/frameworks";
import { REL_META, type ControlStatus, type MatchStrength, type Relationship, type ReqStatus } from "@/lib/mapper";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 max-w-3xl text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
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

export function Progress({ value, color = "#047fff", className = "" }: { value: number; color?: string; className?: string }) {
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

/** ABHEDIT logo lockup: official wordmark + product name. */
export function Logo({ className = "", dark = false, product = true }: { className?: string; dark?: boolean; product?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dark ? "/brand/abhedit-logo-white.svg" : "/brand/abhedit-logo.svg"} alt="Abhedit" width={118} height={28} className="h-7 w-auto" />
      {product && (
        <span className={`hidden border-l pl-2.5 text-sm font-semibold tracking-tight whitespace-nowrap sm:inline ${dark ? "border-white/25 text-slate-200" : "border-slate-300 text-slate-600"}`}>
          Control Mapper
        </span>
      )}
    </span>
  );
}

export function BrandMark({ className = "h-6 w-6" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/abhedit-mark.svg" alt="" aria-hidden className={className} />;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">{children}</div>;
}

export function fmtDate(ms: number | null | undefined) {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const REL_STYLE: Record<Relationship, string> = {
  equal: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  subset_of: "bg-sky-100 text-sky-800 ring-sky-200",
  superset_of: "bg-amber-50 text-amber-800 ring-amber-200",
  intersects_with: "bg-slate-100 text-slate-500 ring-slate-200",
};

/** NIST IR 8477 STRM relationship of a requirement to a control. */
export function RelBadge({ rel, compact = false }: { rel: Relationship; compact?: boolean }) {
  const m = REL_META[rel];
  return (
    <span title={`${m.label}: ${m.help}`} className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ring-1 ring-inset ${REL_STYLE[rel]}`}>
      <span className="font-mono">{m.symbol}</span>
      {!compact && m.label}
    </span>
  );
}

const MATCH_STYLE: Record<MatchStrength, [string, string, string]> = {
  equivalent: ["Equivalent", "bg-emerald-600 text-white", "Both requirements are equal in scope to the same control."],
  strong: ["Strong", "bg-emerald-100 text-emerald-800", "Both requirements are fully covered by the same control."],
  partial: ["Partial", "bg-amber-100 text-amber-800", "The requirements overlap through a control that covers only part of one of them."],
  weak: ["Supporting", "bg-slate-100 text-slate-500", "Linked only through a supportive (∩) relationship."],
};

export function MatchBadge({ match }: { match: MatchStrength }) {
  const [label, cls, help] = MATCH_STYLE[match];
  return <span title={help} className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${cls}`}>{label}</span>;
}

export function ProvenanceMark({ corroborated }: { corroborated: boolean }) {
  return corroborated ? (
    <span title="Independently corroborated by the SCF reference crosswalk" className="text-[11px] font-semibold whitespace-nowrap text-emerald-700">✓ SCF</span>
  ) : (
    <span title="Analyst-asserted mapping (reviewed, not present in the reference crosswalk)" className="text-[11px] whitespace-nowrap text-slate-400">analyst</span>
  );
}

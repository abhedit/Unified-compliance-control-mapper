import Link from "next/link";
import { Mail } from "lucide-react";
import { Logo } from "./ui";

const COLUMNS: [string, [string, string][]][] = [
  ["Control Mapper", [["/map", "Free cross-framework mapper"], ["/assess", "Applicability assessment"], ["/#frameworks", "Frameworks"], ["/#pricing", "Pricing"], ["/signup", "Start free"]]],
  ["Trust & method", [["/methodology", "Mapping methodology"], ["/docs", "REST API"], ["/methodology#coverage", "Coverage by framework"]]],
  ["Abhedit platform", [["https://abhedit.com", "Abhedit Comply"], ["https://abhedit.com", "Abhedit Trust"], ["https://abhedit.com", "Abhedit AI"], ["https://abhedit.com", "Privacy as a Service"], ["https://abhedit.com", "AI Governance as a Service"]]],
];

const SOCIALS: [string, string, string][] = [
  ["https://www.linkedin.com/company/abhedit", "LinkedIn", "in"],
  ["https://www.youtube.com/@abhedit", "YouTube", "yt"],
  ["https://www.instagram.com/abhedit.s/", "Instagram", "ig"],
  ["https://www.facebook.com/Abhedit/", "Facebook", "f"],
];

export default function SiteFooter() {
  return (
    <footer className="bg-ink px-4 pt-16 pb-8 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo dark />
          <p className="mt-4 max-w-xs text-sm text-slate-400">Security, privacy, compliance and AI governance — map one control across every framework you need.</p>
          <div className="mt-6 flex gap-3">
            {SOCIALS.map(([href, label, short]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer noopener" aria-label={`Abhedit on ${label}`} title={label}
                className="grid h-8 w-8 place-items-center rounded-full border border-white/30 text-[11px] font-bold text-white hover:border-brand-500 hover:text-brand-500">
                {short}
              </a>
            ))}
            <a href="mailto:contact@abhedit.com" aria-label="Email Abhedit" title="contact@abhedit.com" className="grid h-8 w-8 place-items-center rounded-full border border-white/30 text-white hover:border-brand-500 hover:text-brand-500">
              <Mail size={14} />
            </a>
          </div>
        </div>
        {COLUMNS.map(([title, links]) => (
          <div key={title} className="flex flex-col gap-2.5">
            <h3 className="text-xs font-semibold tracking-wide text-white uppercase">{title}</h3>
            {links.map(([href, label]) => (
              <Link key={label} href={href} className="text-sm text-slate-400 hover:text-white">{label}</Link>
            ))}
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 md:flex-row md:justify-between">
        <span>© {new Date().getFullYear()} Abhedit. All rights reserved.</span>
        <span className="max-w-3xl md:text-right">
          Mappings are reference crosswalks for planning and evidence reuse; they are not legal advice or certification. Framework names are trademarks of their respective owners.
        </span>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "./ui";

const LINKS = [
  ["/assess", "What applies to me?"],
  ["/map", "Free mapper"],
  ["/#frameworks", "Frameworks"],
  ["/methodology", "Methodology"],
  ["/#pricing", "Pricing"],
  ["/docs", "API"],
] as const;

export default function MarketingNav() {
  return (
    <>
      <div className="bg-ink px-4 py-2.5 text-center text-sm font-semibold text-white">
        <span className="hidden sm:inline">New: 23 frameworks across India, the US, the EU and the UK — including the EU AI Act, DORA and CERT-In. </span>
        <Link href="/assess" className="inline-flex items-center gap-1 whitespace-nowrap text-brand-500 hover:text-white">
          Check what applies to you <ArrowRight size={15} />
        </Link>
      </div>
      <header className="sticky top-0 z-20 bg-white shadow-[0_2px_8px_#0f172a0d]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3.5">
          <Link href="/" aria-label="Abhedit Control Mapper home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 text-[15px] font-semibold text-ink lg:flex">
            {LINKS.map(([href, label]) => (
              <Link key={href} href={href} className="whitespace-nowrap hover:text-brand-700">
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost hidden sm:inline-flex">Sign in</Link>
            <Link href="/signup" className="btn-primary whitespace-nowrap">
              Start free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

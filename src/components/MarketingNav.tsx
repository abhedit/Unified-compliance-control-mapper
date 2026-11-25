import Link from "next/link";
import { Logo } from "./ui";

export default function MarketingNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/"><Logo /></Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/map" className="hover:text-slate-900">Free mapper</Link>
          <Link href="/assess" className="hover:text-slate-900">What applies to me?</Link>
          <Link href="/#features" className="hover:text-slate-900">Features</Link>
          <Link href="/#frameworks" className="hover:text-slate-900">Frameworks</Link>
          <Link href="/methodology" className="hover:text-slate-900">Methodology</Link>
          <Link href="/#pricing" className="hover:text-slate-900">Pricing</Link>
          <Link href="/docs" className="hover:text-slate-900">API</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn-ghost">Sign in</Link>
          <Link href="/signup" className="btn-primary">Start free</Link>
        </div>
      </div>
    </header>
  );
}

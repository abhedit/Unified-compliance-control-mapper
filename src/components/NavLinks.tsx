"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  ["/app", "Dashboard", "◧"],
  ["/app/obligations", "Obligations", "⚖"],
  ["/app/mapper", "Control mapper", "⇄"],
  ["/app/controls", "Controls", "☰"],
  ["/app/frameworks", "Frameworks", "▦"],
  ["/app/crosswalk", "Crosswalk", "⊞"],
  ["/app/custom", "Custom controls", "✚"],
  ["/app/settings", "Settings & API", "⚙"],
] as const;

export default function NavLinks() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
      {LINKS.map(([href, label, icon]) => {
        const active = href === "/app" ? path === "/app" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap ${
              active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span className="w-4 text-center opacity-70">{icon}</span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

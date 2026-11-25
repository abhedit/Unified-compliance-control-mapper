import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { Logo } from "@/components/ui";
import NavLinks from "@/components/NavLinks";
import { logoutAction } from "@/app/auth-actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const s = await requireSession();
  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-60 lg:shrink-0 lg:flex-col lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/app"><Logo /></Link>
        </div>
        <div className="mx-3 mb-3 rounded-lg bg-slate-50 px-3 py-2">
          <div className="truncate text-sm font-semibold">{s.orgName}</div>
          <div className="text-xs text-slate-500 capitalize">{s.plan} plan</div>
        </div>
        <NavLinks />
        <div className="hidden border-t border-slate-200 p-3 lg:mt-auto lg:block">
          <div className="truncate text-sm font-medium">{s.name}</div>
          <div className="truncate text-xs text-slate-500">{s.email}</div>
          <form action={logoutAction}>
            <button className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-800">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}

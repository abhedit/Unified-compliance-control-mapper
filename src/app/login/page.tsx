import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/ui";
import { LoginForm } from "@/components/AuthForms";
import { getSession } from "@/lib/auth";

export default async function Page() {
  if (await getSession()) redirect("/app");
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#dbeeff_0%,_#f8fafc_55%)] px-4 py-12">
      <div className="w-full max-w-lg">
        <Link href="/" className="mb-6 flex justify-center"><Logo /></Link>
        <div className="card p-8 shadow-[0_18px_40px_#0f172a14]">
          <span className="eyebrow">Abhedit Control Mapper</span>
          <h1 className="display mt-2 text-2xl text-ink">Welcome back</h1>
          <p className="mb-6 text-sm text-slate-500">Sign in to your compliance workspace.</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/ui";
import { SignupForm } from "@/components/AuthForms";
import { getSession } from "@/lib/auth";

export default async function Page() {
  if (await getSession()) redirect("/app");
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#e0e7ff_0%,_#f8fafc_55%)] px-4 py-12">
      <div className="w-full max-w-lg">
        <Link href="/" className="mb-6 flex justify-center"><Logo className="text-lg" /></Link>
        <div className="card p-8">
          <h1 className="text-xl font-bold">Create your workspace</h1>
          <p className="mb-6 text-sm text-slate-500">14-day free trial. No credit card required.</p>
          <SignupForm />
        </div>
      </div>
    </div>
  );
}

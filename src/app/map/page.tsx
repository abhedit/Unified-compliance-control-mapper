import Link from "next/link";
import MarketingNav from "@/components/MarketingNav";
import SiteFooter from "@/components/SiteFooter";
import MapperExplorer from "@/components/MapperExplorer";
import { CONTROLS } from "@/data/controls";
import { parseSelection } from "@/lib/selection";

export const metadata = { title: "Free cross-framework control mapper" };

export default async function PublicMapper({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const initial = parseSelection(await searchParams) ?? { kind: "req" as const, fw: "iso27001" as const, code: "A.8.5" };
  return (
    <div>
      <MarketingNav />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Free cross-framework control mapper</h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">
              Choose a requirement from any framework to see its equivalents in ISO 27001, SOC 2, NIST CSF 2.0, NIST 800-53, HIPAA, PCI DSS 4.0.1, GDPR, CIS v8.1 and the DPDP Act — with NIST IR 8477 relationship types and match strength.
            </p>
          </div>
          <Link href="/signup" className="btn-primary shrink-0">Track readiness in a workspace →</Link>
        </div>
        <MapperExplorer controls={CONTROLS} initial={initial} basePath="/map" />
      </main>
      <SiteFooter />
    </div>
  );
}

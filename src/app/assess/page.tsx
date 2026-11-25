import MarketingNav from "@/components/MarketingNav";
import SiteFooter from "@/components/SiteFooter";
import ApplicabilityWizard from "@/components/ApplicabilityWizard";

export const metadata = { title: "Which compliance frameworks apply to my company?" };

export default function AssessPage() {
  return (
    <div>
      <MarketingNav />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight">Which compliance frameworks apply to your company?</h1>
        <p className="mt-1 mb-6 max-w-3xl text-sm text-slate-500">
          Answer a few questions about where you operate, your industry and the data you handle. We identify the laws, regulations and standards you must or
          should follow — across India, the US, the EU and the UK — and how many unified controls cover them all.
        </p>
        <ApplicabilityWizard mode="public" />
      </main>
      <SiteFooter />
    </div>
  );
}

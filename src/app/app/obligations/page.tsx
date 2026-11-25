import ApplicabilityWizard from "@/components/ApplicabilityWizard";
import { PageHeader } from "@/components/ui";
import { loadWorkspace } from "@/lib/workspace";
import { getProfile } from "@/lib/org";
import { applyScopeAction } from "../actions";

export const metadata = { title: "Compliance obligations" };

export default async function ObligationsPage() {
  const { session, frameworks } = await loadWorkspace();
  return (
    <div>
      <PageHeader
        title="Compliance obligations"
        subtitle="Determine which laws, regulations and standards apply to your organization. Applying the scope enables those frameworks across your workspace — controls you have already implemented count immediately."
      />
      <ApplicabilityWizard mode="app" initialProfile={getProfile(session.orgId)} enabled={frameworks} onApply={applyScopeAction} />
    </div>
  );
}

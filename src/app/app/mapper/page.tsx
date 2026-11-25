import MapperExplorer from "@/components/MapperExplorer";
import { PageHeader } from "@/components/ui";
import { loadWorkspace } from "@/lib/workspace";
import { parseSelection } from "@/lib/selection";
import { FRAMEWORK_BY_ID } from "@/data/frameworks";

export const metadata = { title: "Control mapper" };

export default async function MapperPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { frameworks, controls, status } = await loadWorkspace();
  const fws = frameworks.length ? frameworks : undefined;
  const first = fws?.[0] ?? "iso27001";
  const initial = parseSelection(await searchParams) ?? { kind: "req" as const, fw: first, code: FRAMEWORK_BY_ID[first].requirements[0].code };
  return (
    <div>
      <PageHeader
        title="Control mapper"
        subtitle="Map one requirement or control across every framework in your workspace. Dots show your implementation status; click any equivalent requirement to pivot."
      />
      <MapperExplorer controls={controls} frameworks={fws} statuses={status} initial={initial} controlBase="/app/controls/" basePath="/app/mapper" />
    </div>
  );
}

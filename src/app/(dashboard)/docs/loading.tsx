import { PageHeader } from "@/components/page-header";
import { DocumentRowSkeleton } from "@/components/skeletons";

export default function DocsLoading() {
  return (
    <div>
      <PageHeader title="Docs" />
      <div className="mt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <DocumentRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

import { PageHeader } from "@/components/page-header";
import { ReportCardSkeleton } from "@/components/skeletons";

export default function ReportsLoading() {
  return (
    <div>
      <PageHeader
        title="Relatórios"
        description="Análises e resultados da empresa"
      />
      <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <ReportCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

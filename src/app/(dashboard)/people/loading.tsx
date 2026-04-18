import { PageHeader } from "@/components/page-header";
import { PersonCardSkeleton } from "@/components/skeletons";

export default function PeopleLoading() {
  return (
    <div>
      <PageHeader
        title="Time"
        description="Quem faz a VALK acontecer"
      />
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <PersonCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

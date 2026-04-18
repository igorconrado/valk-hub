import { PageHeader } from "@/components/page-header";
import { MeetingCardSkeleton } from "@/components/skeletons";

export default function MeetingsLoading() {
  return (
    <div>
      <PageHeader title="Reuniões" description="Atas, decisões e pendências" />
      <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <MeetingCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
